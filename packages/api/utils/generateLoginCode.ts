import { customAlphabet } from "nanoid";

export const generateLoginCode = (length: number): string => {
  const characters = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  const nanoid = customAlphabet(characters, length);

  return nanoid();
};
