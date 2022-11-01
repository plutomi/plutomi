import { customAlphabet } from 'nanoid';

/**
 * Generates a clean ID with 0-9 and all lower case a-z
 * @param length Length of ID - default 24
 * @returns
 */
export const generateId = (length?: number) => {
  const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', length ?? 24);
  return nanoid();
};
