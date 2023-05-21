import {
  RelatedToType,
  type TOTPCode,
  TOTPCodeStatus,
  type User
} from "@plutomi/shared";
import { Schema, validate } from "@plutomi/validation";
import dayjs from "dayjs";
import type { RequestHandler } from "express";

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

  let mostRecentCodes: TOTPCode[];

  try {
    mostRecentCodes = await req.items
      .find<TOTPCode>({
        relatedTo: {
          id: email,
          type: RelatedToType.TOTP_CODE
        }
      })
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();
  } catch (error) {
    console.error(error);
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
    !mostRecentCode ||
    // Expired by status
    mostRecentCode.status === TOTPCodeStatus.EXPIRED ||
    // Expired by exhaustive check
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
        id: email,
        type: RelatedToType.USER
      }
    });
  } catch (error) {
    console.error(`error logging in`);
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

  res.status(200).json({ message: "Logged in successfully!" });

  if (!user.emailVerified) {
    try {
      await req.items.updateOne(
        {
          relatedTo: {
            id: email,
            type: RelatedToType.USER
          }
        },
        {
          $set: {
            emailVerified: true
          }
        }
      );
    } catch (error) {
      console.error(`error ocurred updating user emailVerified`, error);
    }
  }

  // Expire all other codes
  try {
    await req.items.updateMany(
      {
        status: { $ne: TOTPCodeStatus.EXPIRED },
        relatedTo: {
          id: email,
          type: RelatedToType.TOTP_CODE
        }
      },
      {
        $set: {
          status: TOTPCodeStatus.EXPIRED
        }
      }
    );
  } catch (error) {
    console.error(
      `error ocurred updating previous login codes to expired`,
      error
    );
  }
};
