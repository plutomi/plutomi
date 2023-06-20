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
import KSUID from "ksuid";
import { transactionOptions } from "@plutomi/database";
import {
  EMAIL_TEMPLATES,
  clearCookie,
  getCookieJar,
  getSessionCookieName,
  sendEmail,
  sessionIsActive,
  createTotpCodeItem,
  createUser
} from "../../utils";

export const post: RequestHandler = async (req, res) => {
  const cookieJar = getCookieJar({ req, res });
  const sessionId = cookieJar.get(getSessionCookieName(), { signed: true });

  const totpCode = generateTOTP();

  if (sessionId !== undefined) {
    try {
      // If a user already has a session, and it is valid, send a 302 and let the FE redirect
      const session = await req.items.findOne<Session>({
        _id: sessionId as PlutomiId<IdPrefix.SESSION>
      });

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
  let shouldSendCode = false;
  let respondedInTransaction = false;

  const transactionSession = req.client.startSession(transactionOptions);
  let totpCodeItem: TOTPCode | undefined;

  try {
    // 1. Lock the user for concurrent requests / create a new user if they doesn't exist
    // 2. Get the recent login codes for this user, and see if they're allowed to request another one at this time
    // 3. Create a new login code for this user
    const transactionResults = await transactionSession.withTransaction(
      async () => {
        // 1. Get & LOCK the user if they exist with that email, and if not, create them
        const { value } = (await req.items.findOneAndUpdate(
          { email: email as Email },
          {
            $set: {
              // Note: This runs after $setOnInsert, so we can use the user object here
              _locked_at: KSUID.randomSync().string,
              updated_at: new Date()
            },
            $setOnInsert: createUser({
              email: email as Email,
              removedKeys: ["_locked_at", "updated_at"]
            })
          },
          {
            upsert: true,
            returnDocument: ReturnDocument.AFTER,
            session: transactionSession
          }
        )) as ModifyResult<User>;

        if (value === null) {
          // Concurrent request, return an error
          res.status(409).json({
            message: "An error ocurred logging you in, please try again."
          });

          respondedInTransaction = true;
          await transactionSession.abortTransaction();
          return;
        }

        user = value;

        if (!user.can_receive_emails) {
          // TODO: Logging
          res.status(403).json({
            message: `You have unsubscribed from emails from Plutomi. Please reach out to ${PlutomiEmails.JOSE} if you would like to resubscribe.`
          });
          respondedInTransaction = true;
          await transactionSession.abortTransaction();
          return;
        }

        const { _id: userId } = user;

        const recentTotpCodes: TOTPCode[] = await req.items
          // Get N active codes for this user in the last N minutes
          .find<TOTPCode>(
            {
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
            },
            {
              limit: MAX_TOTP_COUNT_ALLOWED_IN_LOOK_BACK_TIME,
              session: transactionSession
            }
          )
          .toArray();

        if (
          recentTotpCodes.length >= MAX_TOTP_COUNT_ALLOWED_IN_LOOK_BACK_TIME
        ) {
          // ! TODO: Log attempt
          res.status(403).json({
            message:
              "You have requested too many login codes recently, please try again in a bit."
          });
          respondedInTransaction = true;
          await transactionSession.abortTransaction();
          return;
        }

        totpCodeItem = createTotpCodeItem({
          userId,
          email: email as Email
        });
        // Create the code
        await req.items.insertOne(totpCodeItem, {
          session: transactionSession
        });

        shouldSendCode = true;
      }
    );
  } catch (error) {
    // TODO: Logging
    if (!respondedInTransaction) {
      // Generic error
      res.status(500).json({
        message: "An error ocurred creating your TOTP code, please try again.",
        error
      });
    }
    return;
  } finally {
    await transactionSession.endSession();
  }

  if (!shouldSendCode) {
    return;
  }

  // Send code to user
  try {
    console.log("Sending mail");
    await sendEmail({
      to: email as Email,
      subject: `Your Plutomi Code - ${totpCode}`,
      from: {
        header: "Plutomi",
        email: PlutomiEmails.NO_REPLY
      },
      bodyHtml: EMAIL_TEMPLATES.TOTPTemplate({ code: totpCode })
    });

    console.log("Mail sent!");
    res.status(201).json({
      message: "A login code has been sent to your email"
    });
  } catch (error) {
    console.log(`DOUBLE SEND HAPPEND?!?!?`);
    // ! TODO: Possible double send? How
    res.status(500).json({
      message: "An error ocurred sending your login code",
      error
    });
  }
};
