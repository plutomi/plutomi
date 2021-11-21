import Time from "./utils/time";
export enum API_METHODS {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  OPTIONS = "OPTIONS",
  DELETE = "DELETE",
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
   * For questions inside of a `${ENTITY_TYPES.STAGE}`
   */
  STAGE_QUESTION = "STAGE_QUESTION",

  /**
   * For rules inside of a `${ENTITY_TYPES.STAGE}`
   */
  STAGE_RULE = "STAGE_RULE",

  /**
   * Login links for `USER`s
   */
  LOGIN_LINK = "LOGIN_LINK",
  /**
   * Tiemstamp of a user login
   */
  LOGIN_EVENT = "LOGIN_EVENT",
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
  /**
   * For entities that can have their order rearranged such as stages, questions, rules, etc.
   * We are storing the order in an array in the parent component.
   * For example:
   * The order of stages is stored in the opening the stage belongs to in a property called stageOrder
   * The order of questions are stored on the stage they belong to in a property called questionOrder
   * and so on...
   *
   * As more items are added, the parent item gets closer to reaching the 400kb item limit on Dynamo.
   *
   * In reality, nobody is likely to hit this threshold. If you have 200 stages in an opening.. or 200 questions in a stage.. something is deeply wrong.
   * I did a test with 3000(!!!) IDs and it came out to around 173kb, less than half of the Dynamo limit.
   * This will be a soft limit and can be raised up to a point with the understanding that performance might suffer.
   */
  MAX_CHILD_ITEM_LIMIT = 200,
}

export enum ERRORS {
  MAX_CHILD_ITEM_LIMIT_ERROR_MESSAGE = `MAX_CHILD_ITEM_LIMIT reached, please contact support@plutomi.com for assistance`,
  INVALID_DATE_ERROR = `The date you provided appears to be invalid`,
}

export enum ID_LENGTHS {
  USER = 42,
  APPLICANT = 60,
  APPLICANT_RESPONSE = 30,
  ORG_INVITE = 50,
  OPENING = 16,
  STAGE = 50,
  STAGE_QUESTION = 50,
  STAGE_RULE = 16,
}

export enum DEFAULTS {
  FIRST_NAME = "NO_FIRST_NAME",
  LAST_NAME = "NO_LAST_NAME",
  FULL_NAME = `NO_FIRST_NAME NO_LAST_NAME`,
  NO_ORG = `NO_ORG_ASSIGNED`,
  // Here https://github.com/plutomi/plutomi/issues/334
}

export enum EMAILS { // TODO replace domain with .env domain
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
   * For administrative / GitHub related
   */
  ADMIN = "jose@plutomi.com",

  /**
   * For login links
   */
  LOGIN = "login@plutomi.com",

  /**
   * For org invites
   */
  INVITES = "join@plutomi.com",
}

/**
 * When using the /public/ api, what properties are allowed to be returned for each entity
 */
export const SAFE_PROPERTIES = {
  APPLICANT: ["firstName", "lastName", "createdAt", "openingId", "stageId"],
  ORG: ["GSI1SK", "orgId"],
  STAGE: ["GSI1SK", "stageId", "createdAt", "questionOrder"],
  USER: ["userId", "orgId", "email", "firstName", "lastName", "GSI1SK"],
  OPENING: ["GSI1SK", "openingId", "createdAt", "stageOrder"],
};

export enum LOGIN_METHODS {
  LINK = "LINK",
  GOOGLE = "GOOGLE",
}

export const NAVBAR_NAVIGATION = [
  {
    name: "Dashboard",
    href: "/dashboard",
    hiddenIfNoOrg: false,
    hiddenIfOrg: false,
  },
  {
    name: "Openings",
    href: "/openings",
    hiddenIfNoOrg: true,
    hiddenIfOrg: false,
  },
  { name: "Team", href: "/team", hiddenIfNoOrg: true, hiddenIfOrg: false },
  {
    name: "Invites",
    href: "/invites",
    hiddenIfNoOrg: false,
    hiddenIfOrg: true,
  },
];
export const DROPDOWN_NAVIGATION = [
  { name: "Your Profile", href: "/profile" },
  { name: "Log Out", href: "#" },
];

// How often we should poll for invites while on the /invites page
export const INVITES_REFRESH_INTERVAL = 10000;

export const SWR = {
  MAX_RETRY_ATTEMPTS: 3,
  INVITES_REFRESH_INTERVAL: 10000,
};
