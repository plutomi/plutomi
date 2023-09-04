import {
  IdPrefix,
  RelatedToType,
  TOTPCodeStatus,
  TOTP_EXPIRATION_TIME_IN_MINUTES,
  generateTOTP,
  type PlutomiId,
  type TOTPCode,
  type Email
} from "@plutomi/shared";
import dayjs from "dayjs";
import { generatePlutomiId } from "../generatePlutomiId/generatePlutomiId";

type CreateTOTPCodeProps = {
  userId: PlutomiId<IdPrefix.USER>;
  email: Email;
};

/**
 *
 * Creates a TOTP Code entity
 */
export const createTotpCode = ({
  userId,
  email
}: CreateTOTPCodeProps): TOTPCode => {
  const now = new Date();
  const totpCodeId = generatePlutomiId({
    date: now,
    idPrefix: IdPrefix.TOTP
  });

  const totp: TOTPCode = {
    _id: totpCodeId,
    _type: IdPrefix.TOTP,
    _locked_at: generatePlutomiId({
      date: now,
      idPrefix: IdPrefix.LOCKED_AT
    }),
    code: generateTOTP(),
    user: userId,
    email,
    created_at: now,
    updated_at: now,
    expires_at: dayjs(now)
      .add(TOTP_EXPIRATION_TIME_IN_MINUTES, "minutes")
      .toDate(),
    expired_at: null,
    invalidated_at: null,
    used_at: null,
    status: TOTPCodeStatus.ACTIVE,
    related_to: [
      {
        id: totpCodeId,
        type: RelatedToType.SELF
      },
      {
        id: userId,
        type: RelatedToType.TOTPS
      },
      {
        id: email,
        type: RelatedToType.TOTPS
      }
    ]
  };

  return totp;
};
