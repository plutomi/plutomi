import { NextApiRequest } from "next";

type CustomDateFormat = string | number; // TODO date types

declare module "iron-session" {
  // TODO session types!!
  interface IronSessionData {
    user?: {
      id: number;
      admin?: boolean;
    };
  }
}

type CustomQuery = {
  orgId?: string;
  openingId?: string;
  userId?: string;
  stageId?: string;
  applicantId?: string;
  key?: string;
  callbackUrl?: string;
  questionId?: string;
  inviteId?: string;
};
