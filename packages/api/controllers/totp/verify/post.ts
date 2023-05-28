import {
  RelatedToType,
  type TOTPCode,
  TOTPCodeStatus,
  type User
} from "@plutomi/shared";
import { Schema, validate } from "@plutomi/validation";
import dayjs from "dayjs";
import type { RequestHandler } from "express";
import { createSession } from "../../../utils/sessions";
import {
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

  let mostRecentCodes: TOTPCode[] = [];

  try {
    mostRecentCodes = await req.items
      .find<TOTPCode>({
        relatedTo: {
          $elemMatch: {
            id: email,
            type: RelatedToType.TOTPS
          }
        }
      })
      .sort({ _id: -1 })
      .limit(1)
      .toArray();
  } catch (error) {
    // TODO: Logging
    res.status(500).json({
      message: "An error ocurred getting your most recent login code",
      error
    });
    return;
  }

  const now = dayjs();

  const mostRecentCode = mostRecentCodes[0];
  if (
    // Code not found
    mostRecentCode === undefined ||
    // Expired by status
    mostRecentCode.status === TOTPCodeStatus.EXPIRED ||
    // Code has been used
    mostRecentCode.status === TOTPCodeStatus.USED ||
    // Expired by date exhaustive check
    // TODO: Can remove when scheduled events are in
    dayjs(mostRecentCode.expiresAt).isBefore(now) ||
    // Code is invalid
    mostRecentCode.code !== totpCode
  ) {
    // ! TODO: Increment attempts here, block email if too many attempts
    res.status(403).json({ message: "Invalid login code" });
    return;
  }

  // Get the user to set the cookie
  let user: User | null = null;

  try {
    user = await req.items.findOne<User>({
      relatedTo: {
        $elemMatch: {
          id: email,
          type: RelatedToType.USERS
        }
      }
    });
  } catch (error) {
    // TODO: Logging
    res
      .status(500)
      .json({ message: "An error ocurred logging you in!", error });
    return;
  }

  // This shouldn't happen, but just in case
  if (user === null) {
    res.status(500).json({ message: "An error ocurred logging you in!" });
    return;
  }

  const { _id: userId } = user;

  try {
    const sessionId = await createSession({ req, userId });
    const cookieJar = getCookieJar({ req, res });
    cookieJar.set(getSessionCookieName(), sessionId, getCookieSettings());

    res.status(200).json({ message: "Logged in successfully!" });
  } catch (error) {
    res.status(500).json({ message: "An error ocurred logging you in", error });
    return;
  }

  const nowIso = now.toISOString();
  if (!user.emailVerified) {
    try {
      await req.items.updateOne(
        {
          relatedTo: {
            $elemMatch: {
              id: email,
              type: RelatedToType.USERS
            }
          }
        },
        {
          $set: {
            emailVerified: true,
            emailVerifiedAt: nowIso,
            updatedAt: nowIso
          }
        }
      );
    } catch (error) {
      // TODO: Logging
    }
  }

  const { _id: usedCodeId } = mostRecentCode;

  try {
    // Mark the code that was just used as used
    await req.items.updateOne(
      {
        _id: usedCodeId
      },
      {
        $set: {
          status: TOTPCodeStatus.USED,
          updatedAt: nowIso
        }
      }
    );
  } catch (error) {
    // ! TODO: Logging
  }

  // Expire all other active codes
  try {
    await req.items.updateMany(
      {
        _id: { $ne: usedCodeId },
        status: TOTPCodeStatus.ACTIVE,
        relatedTo: {
          $elemMatch: {
            id: email,
            type: RelatedToType.TOTPS
          }
        }
      },
      {
        $set: {
          status: TOTPCodeStatus.EXPIRED,
          updatedAt: nowIso
        }
      }
    );
  } catch (error) {
    // ! TODO: Logging
  }
};
