import {
  RelatedToType,
  TOTPCodeStatus,
  type User,
  type TOTPCode,
  type AllEntities,
  IdPrefix,
  generatePlutomiId
} from "@plutomi/shared";
import { Schema, validate } from "@plutomi/validation";
import type { RequestHandler } from "express";
import { transactionOptions } from "@plutomi/database";
import {
  type ModifyResult,
  ReturnDocument,
  type StrictFilter,
  type Filter,
  type StrictUpdateFilter
} from "mongodb";
import dayjs from "dayjs";
import {
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
      const findUserByEmailFilter: StrictFilter<User> = {
        email
      };

      const lockUserUpdateFilter: StrictUpdateFilter<User> = {
        $set: {
          _locked_at: generatePlutomiId({
            date: now,
            idPrefix: IdPrefix.LOCKED_AT
          }),
          updated_at: now
        }
      };
      const { value: user } = (await req.items.findOneAndUpdate(
        findUserByEmailFilter as Filter<AllEntities>,
        lockUserUpdateFilter,
        {
          returnDocument: ReturnDocument.AFTER,
          session: transactionSession
        }
      )) as ModifyResult<User>;

      if (user === null) {
        // Concurrent request, return an error
        // User guaranteed to exist at this point as they are created when a code is sent
        res.status(409).json({
          message: "An error ocurred logging you in, please try again."
        });

        respondedInTransaction = true;
        await transactionSession.abortTransaction();
        return;
      }
      // 2. Get the most recent code for this user
      const getMostRecentCodeFilter: StrictFilter<TOTPCode> = {
        related_to: {
          $elemMatch: {
            id: email,
            type: RelatedToType.TOTPS
          }
        }
      };
      const mostRecentCode = (
        await req.items
          .find<TOTPCode>(getMostRecentCodeFilter as Filter<AllEntities>, {
            session: transactionSession,
            sort: { created_at: -1 },
            limit: 1
          })
          .toArray()
      )[0];

      // Check if the code is valid
      if (
        // No code
        mostRecentCode === undefined ||
        // No longer active
        mostRecentCode.status !== TOTPCodeStatus.ACTIVE ||
        // Expired by date exhaustive check
        // TODO: Can remove when scheduled events are in
        dayjs(mostRecentCode.expires_at).isBefore(new Date()) ||
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

      // 3. Mark the code that was just used as used
      const { _id: mostRecentCodeId } = mostRecentCode;
      const findMostRecentCodeByIdFilter: StrictFilter<TOTPCode> = {
        _id: mostRecentCodeId
      };
      const updateMostRecentCodeByIdFilter: StrictUpdateFilter<TOTPCode> = {
        $set: {
          status: TOTPCodeStatus.USED,
          used_at: now,
          updated_at: now,
          _locked_at: generatePlutomiId({
            date: now,
            idPrefix: IdPrefix.LOCKED_AT
          })
        }
      };
      await req.items.updateOne(
        findMostRecentCodeByIdFilter as Filter<AllEntities>,
        updateMostRecentCodeByIdFilter,
        { session: transactionSession }
      );

      // 4. Invalidate all other active codes
      const getOtherActiveCodesFilter: StrictFilter<TOTPCode> = {
        _id: { $ne: mostRecentCodeId },
        status: TOTPCodeStatus.ACTIVE,
        related_to: {
          $elemMatch: {
            id: email,
            type: RelatedToType.TOTPS
          }
        }
      };

      const invalidateOtherActiveCodesUpdateFilter: StrictUpdateFilter<TOTPCode> =
        {
          $set: {
            status: TOTPCodeStatus.INVALIDATED,
            updated_at: now,
            invalidated_at: now,
            _locked_at: generatePlutomiId({
              date: now,
              idPrefix: IdPrefix.LOCKED_AT
            })
          }
        };
      await req.items.updateMany(
        getOtherActiveCodesFilter as Filter<AllEntities>,
        invalidateOtherActiveCodesUpdateFilter,
        { session: transactionSession }
      );

      const { _id: userId } = user;

      if (!user.email_verified) {
        // 5. Update the user's verified email status if needed
        const getUserByIdFilter: StrictFilter<User> = {
          _id: userId
        };
        const verifyUserEmailUpdateFilter: StrictUpdateFilter<User> = {
          $set: {
            updated_at: now,
            _locked_at: generatePlutomiId({
              date: now,
              idPrefix: IdPrefix.LOCKED_AT
            }),
            email_verified_at: now,
            email_verified: true
          }
        };
        await req.items.updateOne(
          getUserByIdFilter as Filter<AllEntities>,
          verifyUserEmailUpdateFilter,
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
