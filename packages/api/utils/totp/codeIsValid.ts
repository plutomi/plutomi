import { type TOTPCode, TOTPCodeStatus } from "@plutomi/shared";
import dayjs from "dayjs";

type CodeIsValidProps = {
  codeFromClient: string;
  mostRecentCode?: TOTPCode;
};

export const codeIsValid = ({
  codeFromClient,
  mostRecentCode
}: CodeIsValidProps): boolean => {
  if (
    // No code
    mostRecentCode === undefined ||
    // No longer active
    mostRecentCode.status !== TOTPCodeStatus.ACTIVE ||
    // Expired by date exhaustive check
    // TODO: Can remove when scheduled events are in
    dayjs(mostRecentCode.expires_at).isBefore(new Date()) ||
    // Code is wrong
    mostRecentCode.code !== codeFromClient
  ) {
    return false;
  }

  return true;
};
