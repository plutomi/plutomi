import {
  AllEntityNames,
  RelatedToType,
  generateTOTPCode,
  type User,
  type Email,
  type TOTPCode,
  TOTPCodeStatus,
  MAX_TOTP_CODE_LOOK_BACK_TIME_IN_MINUTES,
  MAX_TOTP_CODES_IN_LOOK_BACK_TIME,
  TOTP_CODE_EXPIRATION_TIME_IN_MINUTES
} from "@plutomi/shared";
import { Schema, validate } from "@plutomi/validation";
import type { RequestHandler } from "express";
import dayjs from "dayjs";
import { generatePlutomiId } from "../../utils";

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

  // Check if a user exists with that email, and if not, create them
  let user: User | null = null;

  try {
    user = await req.items.findOne<User>({
      relatedTo: {
        id: email,
        type: RelatedToType.USER
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error ocurred checking if a user exists with that email.",
      error
    });
    return;
  }

  if (user === null) {
    const now = dayjs();
    const nowIso = now.toISOString();
    const userId = generatePlutomiId({
      date: now.toDate(),
      entity: AllEntityNames.USER
    });
    const userData: User = {
      _id: userId,
      firstName: null,
      lastName: null,
      emailVerified: false,
      canReceiveEmails: true,
      email: email as Email,
      createdAt: nowIso,
      updatedAt: nowIso,
      entityType: AllEntityNames.USER,
      relatedTo: [
        {
          id: AllEntityNames.USER,
          type: RelatedToType.ENTITY
        },
        {
          id: userId,
          type: RelatedToType.ID
        },
        {
          id: email as Email,
          type: RelatedToType.USER
        }
      ]
    };

    try {
      // ! TODO: Concurrency issue when two people make the request at the same time
      await req.items.insertOne(userData);
      user = userData;
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "An error ocurred creating your user account",
        error
      });
      return;
    }
  }

  let recentTotpCodes: TOTPCode[] = [];
  const { _id: userId } = user;

  try {
    const now = dayjs();
    recentTotpCodes = await req.items
      .find<TOTPCode>(
        {
          relatedTo: {
            id: userId,
            type: RelatedToType.TOTP_CODE
          },
          createdAt: {
            $gte: now
              .subtract(MAX_TOTP_CODE_LOOK_BACK_TIME_IN_MINUTES, "minutes")
              .toISOString()
          }
        },
        {
          limit: MAX_TOTP_CODES_IN_LOOK_BACK_TIME
        }
      )
      .toArray();
    console.log(`RECENT`, recentTotpCodes);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error ocurred checking for recent login codes",
      error
    });
    return;
  }

  if (recentTotpCodes.length >= MAX_TOTP_CODES_IN_LOOK_BACK_TIME) {
    res.status(403).json({
      message:
        "You have requested too many login codes recently, please try again in a bit."
    });
    return;
  }

  try {
    const now = dayjs();
    const nowIso = now.toISOString();
    const totpCodeId = generatePlutomiId({
      date: now.toDate(),
      entity: AllEntityNames.TOTP_CODE
    });

    const newTotpCode: TOTPCode = {
      _id: totpCodeId,
      code: generateTOTPCode(),
      createdAt: nowIso,
      updatedAt: nowIso,
      entityType: AllEntityNames.TOTP_CODE,
      expiresAt: now
        .add(TOTP_CODE_EXPIRATION_TIME_IN_MINUTES, "minutes")
        .toISOString(),
      status: TOTPCodeStatus.ACTIVE,
      relatedTo: [
        {
          id: AllEntityNames.TOTP_CODE,
          type: RelatedToType.ENTITY
        },
        {
          id: totpCodeId,
          type: RelatedToType.ID
        },
        {
          id: userId,
          type: RelatedToType.TOTP_CODE
        }
      ]
    };

    await req.items.insertOne(newTotpCode);

    res.status(201).json({
      message: "A login code has been sent to your email."
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error ocurred creating your login code",
      error
    });
  }
};
