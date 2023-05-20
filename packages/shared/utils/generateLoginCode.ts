import { customAlphabet } from "nanoid";
import { LOGIN_CODE_LENGTH } from "../consts";

type GenerateLoginCodeProps = {
  /**
   * The length of the code to generate
   * @default {@link LOGIN_CODE_LENGTH}
   */
  length?: number;
};

export const generateLoginCode = ({
  length = LOGIN_CODE_LENGTH
}: GenerateLoginCodeProps = {}): string => {
  const characters = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  const nanoid = customAlphabet(characters, length);

  return nanoid();
};
