import {
  RelatedToType,
  TOTPCodeStatus,
  type Email,
  type User,
  type TOTPCode,
  delay
} from "@plutomi/shared";
import { Schema, validate } from "@plutomi/validation";
import dayjs from "dayjs";
import type { RequestHandler } from "express";
import KSUID from "ksuid";
import { transactionOptions } from "@plutomi/database";
import { type ModifyResult, ReturnDocument } from "mongodb";
import {
  createSession,
  getCookieJar,
  getCookieSettings,
  getSessionCookieName
} from "../../../utils";

export const post: RequestHandler = async (req, res) => {
  const { data, errorHandled } = validate({
    req,
    res,
    schema: Schema.LogInOrSignUp.validateEmailAndTotp.APISchema
  });

  if (errorHandled) {
    return;
  }

  const { email, totpCode } = data;

  const transactionSession = req.client.startSession(transactionOptions);
  let respondedInTransaction = false;

  try {
    // 1. Lock the user for concurrent requests
    // 2. Get the most recent login code for this user, see if it is valid
    // 3. Create a new login code for this user
    // 4. Invalidate all other active codes
    // 5. Update the user's session
    await transactionSession.withTransaction(async () => {
      const now = new Date();

      // 1. Lock the user
      const { value: user } = (await req.items.findOneAndUpdate(
        { email: email as Email },
        {
          $set: {
            _locked_at: KSUID.randomSync().string,
            updated_at: now
          }
        },
        {
          upsert: true,
          returnDocument: ReturnDocument.AFTER,
          session: transactionSession
        }
      )) as ModifyResult<User>;
      await delay({ ms: 5000 });

      if (user === null) {
        // Concurrent request, return an error
        res.status(409).json({
          message: "An error ocurred logging you in, please try again."
        });

        respondedInTransaction = true;
        await transactionSession.abortTransaction();
        return;
      }
      // 2. Get the most recent code for this user
      const mostRecentCodes = await req.items
        .find<TOTPCode>({
          related_to: {
            $elemMatch: {
              id: email,
              type: RelatedToType.TOTPS
            }
          }
        })
        .sort({ _id: -1 })
        .limit(1)
        .toArray();

      const mostRecentCode = mostRecentCodes[0];

      if (
        // Code not found
        mostRecentCode === undefined ||
        // No longer active
        mostRecentCode.status !== TOTPCodeStatus.ACTIVE ||
        // Expired by date exhaustive check
        // TODO: Can remove when scheduled events are in
        dayjs(mostRecentCode.expires_at).isBefore(now) ||
        // Code is wrong
        mostRecentCode.code !== totpCode
      ) {
        // TODO: Logging
        // ! TODO: Increment attempts here, block email if too many attempts
        res.status(403).json({ message: "Invalid login code" });
        respondedInTransaction = true;
        await transactionSession.abortTransaction();
        return;
      }

      const { _id: userId } = user;

      const newSession = await createSession({
        req,
        now,
        userId
      });

      // Create the new session
      await req.items.insertOne(newSession, { session: transactionSession });

      // Mark the code that was just used as used
      const { _id: mostRecentCodeId } = mostRecentCode;
      await req.items.updateOne(
        {
          _id: mostRecentCodeId
        },
        {
          $set: {
            status: TOTPCodeStatus.USED,
            updated_at: now,
            used_at: now,
            // Lock the code
            _locked_at: KSUID.randomSync().string
          }
        },
        { session: transactionSession }
      );

      // Update the user's verified email status if needed
      await req.items.updateOne(
        {
          related_to: {
            $elemMatch: {
              id: email,
              type: RelatedToType.USERS
            }
          }
        },
        {
          $set: {
            email_verified: true,
            email_verified_at: now,
            updated_at: now,
            _locked_at: KSUID.randomSync().string
          }
        },
        { session: transactionSession }
      );

      // Invalidate all other active codes
      await req.items.updateMany(
        {
          _id: { $ne: mostRecentCodeId },
          status: TOTPCodeStatus.ACTIVE,
          related_to: {
            $elemMatch: {
              id: email,
              type: RelatedToType.TOTPS
            }
          }
        },
        {
          $set: {
            status: TOTPCodeStatus.INVALIDATED,
            updated_at: now,
            invalidated_at: now,
            _locked_at: KSUID.randomSync().string
          }
        },
        { session: transactionSession }
      );

      const { _id: sessionId } = newSession;
      const cookieJar = getCookieJar({ req, res });
      cookieJar.set(getSessionCookieName(), sessionId, getCookieSettings());

      res.status(200).json({ message: "Logged in successfully!" });
    });
  } catch (error) {
    if (!respondedInTransaction) {
      res.status(500).json({
        message: "An error ocurred logging you in",
        error
      });
      return;
    }
  } finally {
    await transactionSession.endSession();
  }
};
