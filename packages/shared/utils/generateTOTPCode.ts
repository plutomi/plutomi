import { customAlphabet } from "nanoid";
import { TOTP_LENGTH } from "../consts";

type GenerateTOTPProps = {
  /**
   * The length of the code to generate
   * @default {@link TOTP_CODE_LENGTH}
   */
  length?: number;
};

export const generateTOTP = ({
  length = TOTP_LENGTH
}: GenerateTOTPProps = {}): string => {
  const characters = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  const nanoid = customAlphabet(characters, length);

  return nanoid();
};
