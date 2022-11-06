import { customAlphabet } from 'nanoid';

interface GenerateIdProps {
  length?: number;
  fullAlphabet?: boolean;
}
/**
 * Generates a clean ID with 0-9 and all lower case a-z
 * @param length Length of ID - default 24
 * @param fullAlphabet Whether to include caps and '-' and '_' keys
 * @returns
 */
export const generateId = ({ length, fullAlphabet }: GenerateIdProps) => {
  let alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';

  if (fullAlphabet) {
    alphabet += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ-_';
  }

  const nanoid = customAlphabet(alphabet, length ?? 24); // TODO this isn't working
  return nanoid();
};
