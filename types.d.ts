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

export enum EntityTypes {
  /**
   * For applicants
   */
  APPLICANT = "APPLICANT",

  /**
   * For applicant responses to a `STAGE_QUESTION`
   */
  APPLICANT_RESPONSE = "APPLICANT_RESPONSE",
  /**
   * For organizations
   */
  ORG = "ORG",

  /**
   * Invites to join an organization
   */
  ORG_INVITE = "ORG_INVITE",

  /**
   * For users of the service
   */
  USER = "USER",

  /**
   * For openings inside an `ORG`
   */
  OPENING = "OPENING",

  /**
   * For stages inside an `ORG`
   */
  STAGE = "STAGE",

  /**
   * For questions inside of a `STAGE`
   */
  STAGE_QUESTION = "STAGE_QUESTION",

  /**
   * For rules inside of a `STAGE`
   */
  STAGE_RULE = "STAGE_RULE",

  /**
   * Login links for `USER`s
   */
  LOGIN_LINK = "LOGIN_LINK",
}

export enum TimeUnits {
  MILLISECONDS = "milliseconds",
  SECONDS = "seconds",
  MINUTES = "minutes",
  HOURS = "hours",
  DAYS = "days",
  WEEKS = "weeks",
  MONTHS = "months",
  YEARS = "years",
}

export interface DynamoBase {
  /**
   * Primary key
   */
  readonly PK: string;
  /**
   * Sort key
   */
  readonly SK: string;
  /**
   * Which org this entity belongs to
   */
  readonly orgId: string;
  /**
   * When was this entity created
   */
  readonly createdAt: Date;
  /**
   * What type of entity is this
   */
  readonly entityType: EntityTypes;
  /**
   * Optional GSI1 primary key
   */
  readonly GSI1PK?: string;
  /**
   * Optional GSI1 sort key
   */
  readonly GSI1SK?: string;
  /**
   * Optional GSI2 primary key
   */
  readonly GSI2PK?: string;
  /**
   * Optional GSI2 sort key
   */
  readonly GSI2SK?: string;
}

export interface DynamoApplicant extends DynamoBase {
  firstName: string;
  lastName: string;
  fullName: string;
  applicantId: string;
  applicantEmail: string;
  isApplicantEmailVerified: boolean;
  entityType: EntityTypes.APPLICANT;
  currentOpeningId: string;
  currentStageId: string;
}
export interface CreateApplicantInput {
  /**
   * The org this user belongs to
   */
  readonly orgId: string;
  /**
   * The email of the applicant
   */
  readonly applicantEmail: string;
  /**
   * First name of the applicant
   * @default - NO_FIRST_NAME
   */
  readonly firstName?: string;
  /**
   * Last name of the applicant
   * @default - NO_LAST_NAME
   *
   * */
  readonly lastName?: string;
  /**
   * Which opening this applicant should be created in
   */
  readonly openingId: string;
  /**
   * Which stage this applicant should be created in
   */
  readonly stageId: string;
}
