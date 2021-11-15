import { NextApiRequest, NextApiResponse } from "next";
// Misc types used all over

/**
 * All possible parameters in the URL
 */

interface CUSTOM_QUERY {
  /**
   * Id of the org
   */
  orgId: string;
  /**
   * Id of the opening
   */
  openingId: string;
  /**
   * Id of the user
   */
  userId: string;
  /**
   * Id of the stage
   */
  stageId: string;
  /**
   * Id of the applicant
   */
  applicantId: string;
  /**
   * The key to for the LOGIN_LINKS that allow it to be used
   */
  key: string;
  /**
   * The callback url
   */
  callbackUrl: string;
  /**
   * Id for the question
   */
  questionId: string;
  /**
   * Id for the invite
   */
  inviteId: string;
}

export enum ENTITY_TYPES {
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

export enum TIME_UNITS {
  MILLISECONDS = "milliseconds",
  SECONDS = "seconds",
  MINUTES = "minutes",
  HOURS = "hours",
  DAYS = "days",
  WEEKS = "weeks",
  MONTHS = "months",
  YEARS = "years",
}

export enum LIMITS {
  MAX_CHILD_ITEM_LIMIT = 200,
}

export enum ERRORS {
  MAX_CHILD_ITEM_LIMIT_ERROR_MESSAGE = `MAX_CHILD_ITEM_LIMIT reached, please contact support@plutomi.com for assistance`,
  INVALID_DATE_ERROR = `The date you provided appears to be invalid`,
}

export enum ID_LENGTHS {
  USER = 42,
  APPLICANT = 60,
  INVITE = 50,
  OPENING = 16,
  STAGE = 50,
  STAGE_QUESTION = 50,
  STAGE_RULE = 16,
}

export enum DEFAULT_VALUES {
  FIRST_NAME = "NO_FIRST_NAME",
  LAST_NAME = "NO_LAST_NAME",
  FULL_NAME = `${DEFAULT_VALUES.FIRST_NAME} ${DEFAULT_VALUES.LAST_NAME}`,
  NO_ORG = `NO_ORG_ASSIGNED`,
}

export enum CONTACT {
  /**
   * For troubleshooting issues
   */
  SUPPORT = "support@plutomi.com",
  /**
   * For general information
   */
  GENERAL = "contact@plutomi.com",
  /**
   * For investor relations
   */
  INVEST = "ir@plutomi.com",
  /**
   * For administrative / Github related
   */
  ADMIN = "jose@plutomi.com",
}

declare module "iron-session" {
  interface IronSessionData {
    user?: {
      orgId: string;
      userId: string;
      userEmail: string;
      // TODO user role RBAC
    };
  }
}
