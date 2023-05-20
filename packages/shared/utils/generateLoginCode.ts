import { customAlphabet } from "nanoid";
import { TOTP_CODE_LENGTH } from "../consts";

type GenerateLoginCodeProps = {
  /**
   * The length of the code to generate
   * @default {@link TOTP_CODE_LENGTH}
   */
  length?: number;
};

export const generateLoginCode = ({
  length = TOTP_CODE_LENGTH
}: GenerateLoginCodeProps = {}): string => {
  const characters = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  const nanoid = customAlphabet(characters, length);

  return nanoid();
};
