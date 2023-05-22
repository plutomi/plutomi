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
  TOTP_CODE_EXPIRATION_TIME_IN_MINUTES,
  PlutomiEmails
} from "@plutomi/shared";
import { Schema, validate } from "@plutomi/validation";
import type { RequestHandler } from "express";
import dayjs from "dayjs";
import { EMAIL_TEMPLATES, generatePlutomiId, sendEmail } from "../../utils";

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
    user = await req.items.findOne<User>({
      relatedTo: {
        id: email,
        type: RelatedToType.USER
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "An error ocurred checking if a user exists with that email",
      error
    });
    return;
  }

  if (user === null) {
    // Create the user first
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
      emailVerifiedAt: null,
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
      res.status(500).json({
        message: "An error ocurred creating your user account",
        error
      });
      return;
    }
  }

  if (!user.canReceiveEmails) {
    res.status(403).json({
      message: `You have unsubscribed from emails from Plutomi. Please reach out to ${PlutomiEmails.JOSE} if you would like to resubscribe.`
    });
    return;
  }

  let recentTotpCodes: TOTPCode[] = [];
  const { _id: userId } = user;

  try {
    const now = dayjs();
    recentTotpCodes = await req.items
      .find<TOTPCode>(
        {
          status: TOTPCodeStatus.ACTIVE,
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
  } catch (error) {
    res.status(500).json({
      message: "An error ocurred checking for any recent login codes",
      error
    });
    return;
  }

  if (recentTotpCodes.length >= MAX_TOTP_CODES_IN_LOOK_BACK_TIME) {
    // ! TODO: Log attempt
    res.status(403).json({
      message:
        "You have requested too many login codes recently, please try again in a bit."
    });
    return;
  }

  const totpCode = generateTOTPCode();

  try {
    const now = dayjs();
    const nowIso = now.toISOString();
    const totpCodeId = generatePlutomiId({
      date: now.toDate(),
      entity: AllEntityNames.TOTP_CODE
    });

    const newTotpCode: TOTPCode = {
      _id: totpCodeId,
      code: totpCode,
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
        },
        {
          id: email as Email,
          type: RelatedToType.TOTP_CODE
        }
      ]
    };

    await req.items.insertOne(newTotpCode);
  } catch (error) {
    res.status(500).json({
      message: "An error ocurred creating your login code",
      error
    });
  }

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
