import { type Session, SessionStatus } from "@plutomi/shared";
import dayjs from "dayjs";

type SessionIsActiveProps = {
  session: Session | null;
};

export const sessionIsActive = ({ session }: SessionIsActiveProps) =>
  session !== null &&
  dayjs().isBefore(dayjs(session.expiresAt)) &&
  session.status === SessionStatus.ACTIVE;
