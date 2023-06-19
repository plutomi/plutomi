import {
  type IdPrefix,
  RelatedToType,
  generateTOTP,
  type User,
  type Email,
  type TOTPCode,
  TOTPCodeStatus,
  PlutomiEmails,
  MAX_TOTP_LOOK_BACK_TIME_IN_MINUTES,
  MAX_TOTP_COUNT_ALLOWED_IN_LOOK_BACK_TIME,
  type Session,
  type PlutomiId
} from "@plutomi/shared";
import { Schema, validate } from "@plutomi/validation";
import type { RequestHandler } from "express";
import dayjs from "dayjs";
import { type ModifyResult, ReturnDocument } from "mongodb";
import {
  EMAIL_TEMPLATES,
  clearCookie,
  getCookieJar,
  getSessionCookieName,
  sendEmail,
  sessionIsActive
} from "../../utils";
import { createTotpCode } from "../../utils/totp";
import { createUser } from "../../utils/users";

export const post: RequestHandler = async (req, res) => {
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

  try {
    // Check if a user exists with that email, and if not, create them
    const { value } = (await req.items.findOneAndUpdate(
      {
        email
      },
      {
        $setOnInsert: createUser({ email: email as Email })
      },
      {
        upsert: true,
        returnDocument: ReturnDocument.AFTER
      }
    )) as ModifyResult<User>;

    if (value === null) {
      // Will be created if it doesn't exist
      // TODO Logging
      return;
    }

    user = value;
  } catch (error) {
    // TODO: Logging
    res.status(500).json({
      message: "An error ocurred creating your login code",
      error
    });
    return;
  }

  if (!user.can_receive_emails) {
    // TODO: Logging
    res.status(403).json({
      message: `You have unsubscribed from emails from Plutomi. Please reach out to ${PlutomiEmails.JOSE} if you would like to resubscribe.`
    });
    return;
  }

  const cookieJar = getCookieJar({ req, res });
  const sessionId = cookieJar.get(getSessionCookieName(), { signed: true });

  if (sessionId !== undefined) {
    // If a user already has a session, and it is valid, redirect them to dashboard
    // TODO: Make dynamic based on where they're logging in from
    try {
      const session = await req.items.findOne<Session>({
        _id: sessionId as PlutomiId<IdPrefix.SESSION>
      });

      if (session !== null && sessionIsActive({ session })) {
        res.status(302).json({
          message: "You already have an active session!"
        });
        return;
      }

      // Delete the previous cookie, if any, they will get a new one on their new login
      // Any other session statuses are irrelevant from this point.
      clearCookie({ cookieJar });
    } catch (error) {
      res.status(500).json({
        message: "An error ocurred creating a session for you",
        error
      });
      return;
    }
  }

  const transactionSession = req.client.startSession();
  const totpCode = generateTOTP();

  try {
    // 1. Lock the user for concurrent requests
    // 2. Get the recent login codes for this user, and see if they're allowed to request another one at this time
    // 3. Create a new login code for this user
    // 4. Unlock the user for concurrent requests
    await transactionSession.withTransaction(async () => {
      const lockedUser = await req.items.findOneAndUpdate(
        // Temporarily lock the user for concurrent requests
        {
          _id: userId,
          is_requesting_totp: false
        },
        {
          $set: {
            is_requesting_totp: true
          }
        },
        { session: transactionSession }
      );

      if (lockedUser.value === null) {
        // Concurrent request, return an error
        res.status(429).json({
          message:
            "You already have a one time code request in progress. Please wait a few seconds and try again."
        });
        return;
      }

      const recentTotpCodes: TOTPCode[] = await req.items
        // Get N active codes for this user in the last N minutes
        .find<TOTPCode>(
          {
            status: TOTPCodeStatus.ACTIVE,
            relatedTo: {
              $elemMatch: {
                id: user?._id,
                type: RelatedToType.TOTPS
              }
            },
            createdAt: {
              $gte: dayjs()
                .subtract(MAX_TOTP_LOOK_BACK_TIME_IN_MINUTES, "minutes")
                .toDate()
            }
          },
          {
            limit: MAX_TOTP_COUNT_ALLOWED_IN_LOOK_BACK_TIME,
            session: transactionSession
          }
        )
        .toArray();

      if (recentTotpCodes.length >= MAX_TOTP_COUNT_ALLOWED_IN_LOOK_BACK_TIME) {
        // ! TODO: Log attempt
        res.status(403).json({
          message:
            "You have requested too many login codes recently, please try again in a bit."
        });
        return;
      }

      // Create the code
      await req.items.insertOne(
        createTotpCode({
          userId,
          email: email as Email
        }),
        {
          session: transactionSession
        }
      );

      // Unlock the user to make another request
      await req.items.updateOne(
        {
          _id: userId,
          is_requesting_totp: true
        },
        {
          $set: {
            is_requesting_totp: false
          }
        },
        {
          session: transactionSession
        }
      );
    });
  } catch (error) {
    // TODO: Logging
    res.status(500).json({
      message: "An error ocurred creating your TOTP code",
      error
    });
    return;
  } finally {
    await transactionSession.endSession();
  }

  // Send code to user
  try {
    await sendEmail({
      to: email as Email,
      subject: `Your Plutomi Code - ${totpCode}`,
      from: {
        header: "Plutomi",
        email: PlutomiEmails.NO_REPLY
      },
      bodyHtml: EMAIL_TEMPLATES.TOTPTemplate({ code: totpCode })
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
