import { customAlphabet } from 'nanoid';

/**
 * Generates a clean ID with 0-9 and all lower case a-z
 * @param length Length of ID - default 24
 * @param fullAlphabet Whether to include caps and '-' and '_' keys
 * @returns
 */
export const generateId = (length?: number, fullAlphabet?: boolean) => {
  let alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';

  if (fullAlphabet) {
    alphabet += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ-_';
  }

  const nanoid = customAlphabet(alphabet, length ?? 24);
  return nanoid();
};
