import {
  IdPrefix,
  RelatedToType,
  TOTPCodeStatus,
  PlutomiEmails,
  MAX_TOTP_LOOK_BACK_TIME_IN_MINUTES,
  MAX_TOTP_COUNT_ALLOWED_IN_LOOK_BACK_TIME,
  type User,
  type Email,
  type TOTPCode,
  type Session,
  type PlutomiId,
  type AllEntities
} from "@plutomi/shared";
import { Schema, validate } from "@plutomi/validation";
import type { RequestHandler } from "express";
import dayjs from "dayjs";
import {
  type ModifyResult,
  ReturnDocument,
  type StrictFilter,
  type Filter,
  type StrictUpdateFilter
} from "mongodb";
import { transactionOptions } from "@plutomi/database";
import KSUID from "ksuid";
import {
  clearCookie,
  getCookieJar,
  getSessionCookieName,
  sessionIsActive,
  createTotpCode,
  postmarkClient,
  generatePlutomiId
} from "../../utils";

/**
 *
 * Creates a user if they don't exist, and sends them a TOTP code via email.
 * Prevents sending multiple emails in a short period of time.
 */
export const post: RequestHandler = async (req, res) => {
  const cookieJar = getCookieJar({ req, res });
  const sessionId = cookieJar.get(getSessionCookieName(), { signed: true });

  if (sessionId !== undefined) {
    // If a user already has a session, and it is valid, send a 302 and let the FE redirect
    try {
      const findSessionByIdFilter: StrictFilter<Session> = {
        _id: sessionId as PlutomiId<IdPrefix.SESSION>
      };
      const session = await req.items.findOne<Session>(
        findSessionByIdFilter as Filter<AllEntities>
      );

      if (session !== null && sessionIsActive({ session })) {
        res.status(302).json({
          message: "You already have an active session!"
        });
        return;
      }

      // Delete the previous cookie as they will get a new one on their new login
      clearCookie({ cookieJar });
    } catch (error) {
      res.status(500).json({
        message: "An error ocurred logging you in",
        error
      });
      return;
    }
  }

  const { data, errorHandled } = validate({
    req,
    res,
    schema: Schema.LogInOrSignUp.email.APISchema
  });

  if (errorHandled) {
    return;
  }

  const { email } = data;

  let user: User | null = null;
  let respondedInTransaction = false;

  const transactionSession = req.client.startSession(transactionOptions);
  let totpCodeItem: TOTPCode | undefined;
  const now = new Date();
  const userId = generatePlutomiId({
    date: now,
    idPrefix: IdPrefix.USER
  });

  try {
    // 1. Lock the user for concurrent requests / create a new user if they doesn't exist
    // 2. Get the recent login codes for this user, and see if they're allowed to request another one at this time
    // 3. Create a new login code for this user
    await transactionSession.withTransaction(async () => {
      // 1. Get & lock the user if they exist with that email, and if not, create them.
      const findUserByEmailFilter: StrictFilter<User> = {
        email: email as Email
      };

      const createOrLockUserUpdateFilter: StrictUpdateFilter<User> = {
        $setOnInsert: {
          _id: userId,
          _type: IdPrefix.USER,
          // _locked_at  & updated_at not set here as $set runs after $setOnInsert
          first_name: null,
          last_name: null,
          email: email as Email,
          email_verified: false,
          email_verified_at: null,
          can_receive_emails: true,
          unsubscribed_from_emails_at: null,
          created_at: now,
          related_to: [
            {
              id: userId,
              type: RelatedToType.SELF
            }
          ]
        },
        $set: {
          // Note: This runs after $setOnInsert
          _locked_at: KSUID.randomSync().string,
          updated_at: new Date()
        }
      };

      const { value } = (await req.items.findOneAndUpdate(
        findUserByEmailFilter as Filter<AllEntities>,
        createOrLockUserUpdateFilter,
        {
          upsert: true,
          returnDocument: ReturnDocument.AFTER,
          session: transactionSession
        }
      )) as ModifyResult<User>;

      if (value === null) {
        // Concurrent request, return an error.
        // User guaranteed to exist at this point due to upsert above
        res.status(409).json({
          message: "An error ocurred logging you in, please try again."
        });

        respondedInTransaction = true;
        await transactionSession.abortTransaction();
        return;
      }

      user = value;

      if (!user.can_receive_emails) {
        // Don't even attempt to create a new code if the user can't receive emails
        // TODO: Logging
        res.status(403).json({
          message: `You have unsubscribed from emails from Plutomi. Please reach out to ${PlutomiEmails.JOSE} if you would like to resubscribe.`
        });
        respondedInTransaction = true;
        await transactionSession.abortTransaction();
        return;
      }

      const getCountOfActiveCodesFilter: StrictFilter<TOTPCode> = {
        status: TOTPCodeStatus.ACTIVE,
        related_to: {
          $elemMatch: {
            id: userId,
            type: RelatedToType.TOTPS
          }
        },
        created_at: {
          $gte: dayjs()
            .subtract(MAX_TOTP_LOOK_BACK_TIME_IN_MINUTES, "minutes")
            .toDate()
        }
      };

      const countOfActiveCodes = await req.items.countDocuments(
        getCountOfActiveCodesFilter,
        {
          limit: MAX_TOTP_COUNT_ALLOWED_IN_LOOK_BACK_TIME,
          session: transactionSession
        }
      );

      if (countOfActiveCodes >= MAX_TOTP_COUNT_ALLOWED_IN_LOOK_BACK_TIME) {
        // ! TODO: Log attempt
        res.status(403).json({
          message:
            "You have requested too many login codes recently, please try again in a bit."
        });
        respondedInTransaction = true;
        await transactionSession.abortTransaction();
        return;
      }

      // Create the code
      totpCodeItem = createTotpCode({
        userId,
        email: email as Email
      });
      await req.items.insertOne(totpCodeItem, {
        session: transactionSession
      });
    });
  } catch (error) {
    // TODO: Logging
    if (!respondedInTransaction) {
      // Generic error
      res.status(500).json({
        message: "An error ocurred creating your login code, please try again.",
        error
      });
    }
    return;
  } finally {
    await transactionSession.endSession();
  }

  if (totpCodeItem === undefined) {
    // Something failed up above and we already responded
    // Also acts as a type guard
    return;
  }

  // Send code to user
  // const { code } = totpCodeItem;
  try {
    // TODO
    await postmarkClient.sendEmail({
      From: "postmark@plutomi.com",
      To: "postmark@plutomi.com",
      Subject: "Hello from Postmark",
      HtmlBody: "<strong>Hello</strong> dear Postmark user.",
      TextBody: "Hello from Postmark!",
      MessageStream: "outbound"
    });

    res.status(201).json({
      message: "A login code has been sent to your email"
    });
  } catch (error) {
    res.status(500).json({
      message: "An error ocurred sending your login code",
      error
    });
  }
};
