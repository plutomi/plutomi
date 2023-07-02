import {
  RelatedToType,
  TOTPCodeStatus,
  type Email,
  type User,
  type TOTPCode
} from "@plutomi/shared";
import { Schema, validate } from "@plutomi/validation";
import type { RequestHandler } from "express";
import KSUID from "ksuid";
import { transactionOptions } from "@plutomi/database";
import { type ModifyResult, ReturnDocument } from "mongodb";
import {
  codeIsValid,
  createSessionItem,
  getCookieJar,
  getCookieSettings,
  getSessionCookieName
} from "../../../utils";

/**
 *
 * Get the most recent code for a user and see if it is valid.
 * If it is, mark it as used and invalidate all other codes.
 * Verify the user's email address and update the user's session with their default workspace.
 */
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
    await transactionSession.withTransaction(async () => {
      const now = new Date();

      // 1. Lock the user to prevent concurrent requests
      const { value: user } = (await req.items.findOneAndUpdate(
        { email: email as Email },
        {
          $set: {
            _locked_at: KSUID.randomSync().string,
            updated_at: now
          }
        },
        {
          returnDocument: ReturnDocument.AFTER,
          session: transactionSession
        }
      )) as ModifyResult<User>;

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
      const mostRecentCode = (
        await req.items
          .find<TOTPCode>(
            {
              related_to: {
                $elemMatch: {
                  id: email,
                  type: RelatedToType.TOTPS
                }
              }
            },
            { session: transactionSession, sort: { created_at: -1 }, limit: 1 }
          )
          .toArray()
      )[0];

      // Check if the code is valid
      if (
        !codeIsValid({
          mostRecentCode,
          codeFromClient: totpCode
        })
      ) {
        // TODO: Logging
        // ! TODO: Increment attempts here, block email if too many attempts
        res.status(403).json({ message: "Invalid login code" });
        respondedInTransaction = true;
        await transactionSession.abortTransaction();
        return;
      }

      // 3. Mark the code that was just used as used
      const { _id: mostRecentCodeId } = mostRecentCode;
      await req.items.updateOne(
        {
          _id: mostRecentCodeId
        },
        {
          $set: {
            status: TOTPCodeStatus.USED,
            used_at: now,
            updated_at: now,
            locked_at: KSUID.randomSync().string
          }
        },
        { session: transactionSession }
      );

      // 4. Invalidate all other active codes
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
            locked_at: KSUID.randomSync().string
          }
        },
        { session: transactionSession }
      );

      const { _id: userId } = user;

      // 5. Update the user's verified email status if needed
      if (!user.email_verified) {
        await req.items.updateOne(
          {
            _id: userId
          },
          {
            $set: {
              email_verified: true,
              email_verified_at: now,
              updated_at: now
            }
          },
          { session: transactionSession }
        );
      }

      const newSession = await createSessionItem({
        req,
        now,
        userId
      });

      // 6. Create the new session for the user at their default workspace
      await req.items.insertOne(newSession, { session: transactionSession });

      const { _id: sessionId } = newSession;
      const cookieJar = getCookieJar({ req, res });
      cookieJar.set(getSessionCookieName(), sessionId, getCookieSettings());

      res.status(200).json({ message: "Logged in successfully!" });
      respondedInTransaction = true;
    });
  } catch (error) {
    // TODO: Logging,
    // Generic error
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
