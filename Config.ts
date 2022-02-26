import Joi from "joi";

/**
 * Some backend dependencies (SES, ACM, Route53, etc..) depend on
 * DOMAIN_NAME being the actual domain name, do not change!
 */
export const DOMAIN_NAME = `plutomi.com`;
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export const WEBSITE_URL =
  process.env.NODE_ENV === "production"
    ? `https://${DOMAIN_NAME}`
    : `http://localhost:3000`;

export const EXPRESS_PORT = 4000;

export const API_DOMAIN =
  process.env.NODE_ENV === "production"
    ? `api.${DOMAIN_NAME}`
    : `localhost:${EXPRESS_PORT}`;

export const API_URL =
  process.env.NODE_ENV === "production"
    ? `https://${API_DOMAIN}`
    : `http://${API_DOMAIN}`;

export const COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "plutomi-cookie"
    : "DEV-plutomi-cookie";

const UrlSafeString = require("url-safe-string"),
  tagGenerator = new UrlSafeString();

export enum OPENING_STATE {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
}

export const DYNAMO_TABLE_NAME = "Plutomi";

export enum ENTITY_TYPES {
  APPLICANT = "APPLICANT",
  APPLICANT_RESPONSE = "APPLICANT_RESPONSE",
  ORG = "ORG",
  ORG_INVITE = "ORG_INVITE",
  USER = "USER",
  OPENING = "OPENING",
  STAGE = "STAGE",
  QUESTION = "QUESTION",
  STAGE_RULE = "STAGE_RULE",
  LOGIN_LINK = "LOGIN_LINK",
  LOGIN_EVENT = "LOGIN_EVENT",
  WEBHOOK = "WEBHOOK",
}

export const TIME_UNITS = {
  MILLISECONDS: "milliseconds",
  SECONDS: "seconds",
  MINUTES: "minutes",
  HOURS: "hours",
  DAYS: "days",
  WEEKS: "weeks",
  MONTHS: "months",
  YEARS: "years",
};

export const ERRORS = {
  NOT_SAME_ORG: "You must belong to this org to perform that action",
  NEEDS_ORG: `You must create or join an organization to perform this action`,
  HAS_PENDING_INVITES: `You seem to have pending invites, please accept or reject them before creating an org :)`,
  EMAIL_VALIDATION: `Hmm... that email doesn't seem quite right. Check it again.`,
};
// https://zelark.github.io/nano-id-cc/
export const ID_LENGTHS = {
  USER: 35, // Unique to application
  APPLICANT: 35, // Unique to application
  APPLICANT_RESPONSE: 10, // Unique to applicant // TODO update with new questions
  ORG_INVITE: 5, // Unique to user & org
  OPENING: 15, // Unique to org
  STAGE: 15, // Unique to opening,
  STAGE_RULE: 10, // TODO, unique to stage
};

export enum DEFAULTS {
  FIRST_NAME = "NO_FIRST_NAME",
  LAST_NAME = "NO_LAST_NAME",
  NO_ORG = `NO_ORG_ASSIGNED`,
  /**
   * When no callbackUrl is provided on login, what page should users be redirected to
   */
  REDIRECT = "dashboard",
  NO_FIRST_NAME = "NO_FIRST_NAME",
  NO_LAST_NAME = "NO_LAST_NAME",
}

export enum LIMITS {
  MAX_OPENING_NAME_LENGTH = 100,
  MAX_STAGE_NAME_LENGTH = 100,
  MAX_QUESTION_TITLE_LENGTH = 100,
  MAX_QUESTION_DESCRIPTION_LENGTH = 500,
  MAX_APPLICANT_FIRSTNAME_LENGTH = 20,
  MAX_APPLICANT_LASTNAME_LENGTH = 20,

  /**
   * How many child items (that can be re-ordered!) is a parent allowed to have.
   * Stages in an opening, rules / questions in a stage.
   */
  MAX_CHILD_ITEM_LIMIT = 200,
}

export const LOGIN_LINK_SETTINGS = {
  password: process.env.LOGIN_LINKS_PASSWORD,
  ttl: 900, // In seconds, how long should login links be valid for
};

export const EMAILS = {
  SUPPORT: "support@plutomi.com",
  GENERAL: "contact@plutomi.com",
  INVEST: "ir@plutomi.com",
  ADMIN: "admin@plutomi.com",
  LOGIN: "login@plutomi.com", // Login links
  JOIN: "join@plutomi.com", // Org invites
  // Jest test accounts
  TESTING: "testing@plutomi.com",
  TESTING2: "testing2@plutomi.com",
  TESTING3: "testing3@plutomi.com",
  TESTING4: "testing4@plutomi.com",
};

/**
 * Properties that cannot be updated no matter the entity type once created
 * This is only for UpdateItem expressions and does not apply for transactions
 * like when a user joins an org, their orgId is updated then.
 * This prevents calling PUT /users/:userId with a new orgId
 */

export const JOI_SETTINGS: Joi.ValidationOptions = {
  presence: "required",
  abortEarly: false,
  stripUnknown: true,
};

/**
 * Global forbidden properties. Cannot be updated, regardless of entity. 
 * undefined keys are stripped
 * https://joi.dev/api/?v=15.1.1#anyforbidden

 */
export const JOI_GLOBAL_FORBIDDEN = {
  orgId: Joi.any().forbidden(),
  PK: Joi.any().forbidden(),
  SK: Joi.any().forbidden(),
  ttlExpiry: Joi.any().forbidden(),
  entityType: Joi.any().forbidden(),
  createdAt: Joi.any().forbidden(),
};

import axios from "axios";
import { NavbarItem } from "./types/main";
export const AXIOS_INSTANCE = axios.create({
  withCredentials: true,
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const SWRFetcher = (url: string) =>
  AXIOS_INSTANCE.get(API_URL + url).then((res) => res.data);

export const NAVBAR_NAVIGATION: NavbarItem[] = [
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
  {
    name: "Questions",
    href: "/questions",
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
  {
    name: "Webhooks",
    href: "/webhooks",
    hiddenIfNoOrg: true,
    hiddenIfOrg: false,
  },
];
export const DROPDOWN_NAVIGATION = [
  { name: "Your Profile", href: "/profile" },
  { name: "Log Out", href: "#" },
];

// Schema to validate orgIds against in joi
export const JoiOrgId = Joi.string()
  .invalid(
    DEFAULTS.NO_ORG,
    tagGenerator.generate(DEFAULTS.NO_ORG),
    "plutomi",
    "plutomi-",
    "plutomi-inc",
    "plutomiinc"
  )
  .max(200);

// If not specified, how long should invites be valid for
export const ORG_INVITE_EXPIRY_DAYS = 3;

export const COOKIE_SETTINGS = {
  httpOnly: true,
  sameSite: true, // (same as strict)
  secure: true,
  maxAge: 1000 * 60 * 60 * 12, // 12 hours
  signed: true,
};
