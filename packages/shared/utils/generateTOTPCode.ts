import { customAlphabet } from "nanoid";
import { TOTP_CODE_LENGTH } from "../consts";

type GenerateTOTPCodeProps = {
  /**
   * The length of the code to generate
   * @default {@link TOTP_CODE_LENGTH}
   */
  length?: number;
};

export const generateTOTPCode = ({
  length = TOTP_CODE_LENGTH
}: GenerateTOTPCodeProps = {}): string => {
  const characters = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  const nanoid = customAlphabet(characters, length);

  return nanoid();
};
