import { LOGIN_CODE_LENGTH } from "@plutomi/shared";
import { customAlphabet } from "nanoid";

type GenerateLoginCodeProps = {
  /**
   * The length of the code to generate
   * @default {@link LOGIN_CODE_LENGTH}
   */
  length: number;
};

export const generateLoginCode = ({
  length = LOGIN_CODE_LENGTH
}: GenerateLoginCodeProps): string => {
  const characters = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  const nanoid = customAlphabet(characters, length);

  return nanoid();
};
