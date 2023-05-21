import {
  RelatedToType,
  TOTPCode,
  TOTPCodeStatus,
  TOTP_CODE_EXPIRATION_TIME_IN_MINUTES,
  User
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

  // ! TODO:

  // get the most recent code only, that is not expired
  // if its not expired, and there are others, expire all others

  let mostRecentCode: TOTPCode | null = null;

  try {
    mostRecentCode = await req.items
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

  if (
    mostRecentCode === null ||
    mostRecentCode.status === TOTPCodeStatus.EXPIRED ||
    dayjs(mostRecentCode.expiresAt).isBefore(now) ||
    mostRecentCode.code !== totpCode
  ) {
    res.status(403).json({ message: "Invalid login code" });
    return;
  }

  res.send(200);
};
