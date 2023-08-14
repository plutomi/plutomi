import { type Session, SessionStatus } from "@plutomi/shared";
import dayjs from "dayjs";

type SessionIsActiveProps = {
  session: Session;
};

export const sessionIsActive = ({ session }: SessionIsActiveProps) =>
  dayjs().isBefore(dayjs(session.expires_at)) &&
  session.status === SessionStatus.ACTIVE;
