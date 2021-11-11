import { NextApiRequest } from "next";

type CustomDateFormat = string | number;

// For requests that require a session
interface NextIronRequest extends NextApiRequest {
  session: Session;
}
type CustomQuery = {
  orgId?: string;
  openingId?: string;
  userId?: string;
  stageId?: string;
  applicantId?: string;
  key?: string;
  callbackUrl?: string;
  question_id?: string;
  invite_id?: string;
};
