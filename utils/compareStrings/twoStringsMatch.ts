import { cleanup } from './cleanup';

interface EmailIsTheSameProps {
  string1: string;
  string2: string;
}

export const twoStringsMatch = ({ string1, string2 }: EmailIsTheSameProps) => {
  if (cleanup(string1) === cleanup(string2)) {
    return true;
  } else {
    return false;
  }
};
