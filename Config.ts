import Time from "./utils/time";
export enum API_METHODS {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  OPTIONS = "OPTIONS",
  DELETE = "DELETE",
}
export const ENTITY_TYPES = {
  APPLICANT: "APPLICANT",
  APPLICANT_RESPONSE: "APPLICANT_RESPONSE",
  ORG: "ORG",
  ORG_INVITE: "ORG_INVITE",
  USER: "USER",
  OPENING: "OPENING",
  STAGE: "STAGE",
  STAGE_QUESTION: "STAGE_QUESTION",
  STAGE_RULE: "STAGE_RULE",
  LOGIN_LINK: "LOGIN_LINK",
  LOGIN_EVENT: "LOGIN_EVENT",
};

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
  LOGIN_EVENT_RETENTION_PERIOD = 30,
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
  APPLICANT_RESPONSE: ["PK", "SK"], // TODO fix - TS7053, just setting this for now so i can test the app lol
  ORG_INVITE: ["PK", "SK"], // TODO same ^
  STAGE_QUESTION: ["PK", "SK"], // TODO same ^
  STAGE_RULE: ["PK", "SK"], // TODO same ^
};

/**
 * Properties that cannot be updated no matter the entity type once created
 */
const GLOBAL_FORBIDDEN_PROPERTIES = [
  "orgId",
  "PK",
  "SK",
  "ttlExpiry",
  "entityType",
  "createdAt",
];

/**
 * Properties that cannot be updated
 */
export const FORBIDDEN_PROPERTIES = {
  USER: [
    ...GLOBAL_FORBIDDEN_PROPERTIES,
    "userRole", // TODO, only admins
    "orgJoinDate",
    "GSI1PK", // Org#EntityType
    "GSI2PK", // Email
  ],
  APPLICANT: [
    ...GLOBAL_FORBIDDEN_PROPERTIES,
    "applicantId",
    "GSI1PK",
    "GSI1SK",
    "GSI2PK",
    "GSI2SK", // TODO, remove these when advancing / moving applicants!!!!!!!!!
  ],
  OPENING: [...GLOBAL_FORBIDDEN_PROPERTIES, "openingId", "GSI1PK"],
  STAGE: [...GLOBAL_FORBIDDEN_PROPERTIES, "stageId", "openingId", "GSI1PK"],
  STAGE_QUESTION: [
    ...GLOBAL_FORBIDDEN_PROPERTIES,
    "questionId",
    "GSI1PK",
    "stageId",
  ],
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

export const SWR = {
  MAX_RETRY_ATTEMPTS: 3,

  /**
   * How often we should poll for invites while on the /invites page.
   * Was a 'cost' saving thing when using Lambda as API.. // TODO revisit this
   */
  INVITES_REFRESH_INTERVAL: 10000,
};
