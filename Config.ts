import Joi from "joi";

import httpEventNormalizer from "@middy/http-event-normalizer";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpResponseSerializer from "@middy/http-response-serializer";
import inputOutputLogger from "@middy/input-output-logger";
import withCleanOrgId from "./middleware/withCleanOrgId";
import cors from "@middy/http-cors";
/**
 * Some backend dependencies (SES, ACM, Route53, etc..) depend on
 * DOMAIN_NAME being the actual domain name, do not change!
 */
export const DOMAIN_NAME = `plutomi.com`;

export const DYNAMIC_DOMAIN = // Use this one for local testing
  process.env.NODE_ENV === "production" ? DOMAIN_NAME : `localhost:3000`;

export const API_SUBDOMAIN =
  process.env.NODE_ENV === "production" ? "api" : "dev";

export const API_DOMAIN = `${API_SUBDOMAIN}.${DOMAIN_NAME}`;

// Full dev environment is created in AWS
export const API_URL = `https://${API_DOMAIN}`;

const PROTOCOL = process.env.NODE_ENV === "production" ? `https://` : `http://`; // localhost
export const WEBSITE_URL = PROTOCOL + DYNAMIC_DOMAIN;

export const COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "plutomi-cookie"
    : "DEV-plutomi-cookie";

const SAME_SITE = process.env.NODE_ENV === "production" ? "Strict" : "None"; // localhost -> dev.plutomi.com
export const COOKIE_SETTINGS = `Secure; HttpOnly; SameSite=${SAME_SITE}; Path=/; Domain=${DOMAIN_NAME}`; // See SESSION_SETTINGS for setting session length
export const sessionDataKeys = [
  "firstName",
  "lastName",
  "orgId",
  "email",
  "userId",
];

const UrlSafeString = require("url-safe-string"),
  tagGenerator = new UrlSafeString();

export const JOI_SETTINGS: Joi.ValidationOptions = {
  presence: "required",
  abortEarly: false,
  stripUnknown: true,
};

export const MIDDY_SERIALIZERS = {
  serializers: [
    {
      regex: /^application\/xml$/,
      serializer: ({ body }) => `<message>${body}</message>`,
    },
    {
      regex: /^application\/json$/,
      serializer: ({ body }) => JSON.stringify(body),
    },
    {
      regex: /^text\/plain$/,
      serializer: ({ body }) => body,
    },
  ],
  default: "application/json",
};

export enum ENTITY_TYPES {
  APPLICANT = "APPLICANT", // TODO remove prefixes #435
  APPLICANT_RESPONSE = "APPLICANT_RESPONSE",
  ORG = "ORG",
  ORG_INVITE = "ORG_INVITE",
  USER = "USER",
  OPENING = "OPENING",
  STAGE = "STAGE",
  STAGE_QUESTION = "STAGE_QUESTION",
  STAGE_RULE = "STAGE_RULE",
  LOGIN_LINK = "LOGIN_LINK",
  LOGIN_EVENT = "LOGIN_EVENT",
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

// https://zelark.github.io/nano-id-cc/
export const ID_LENGTHS = {
  USER: 25, // Unique to application
  APPLICANT: 25, // Unique to application
  APPLICANT_RESPONSE: 10, // Unique to applicant
  ORG_INVITE: 5, // Unique to user
  OPENING: 10, // Unique to org
  STAGE: 10, // Unique to opening
  STAGE_RULE: 10, // TODO, unique to stage
  QUESTION_SET: 10, // TODO unique to org
  STAGE_QUESTION: 10, // TODO, unique to question set, needs name change
};

export enum DEFAULTS {
  FIRST_NAME = "NO_FIRST_NAME",
  LAST_NAME = "NO_LAST_NAME",
  NO_ORG = `NO_ORG_ASSIGNED`,
  /**
   * How many child items (that can be re-ordered!) is a parent allowed to have.
   * Stages in an opening, questions in question sets.
   * Depending on the ID size you can have more or less but this is a good starting default value.
   */
  MAX_CHILD_ITEM_LIMIT = 200,
  /**
   * In days, how long should login  events be kept
   */
  LOGIN_EVENT_RETENTION_PERIOD = 30, // Days
  /**
   * When no callbackUrl is provided on login, what page should users be redirected to
   */
  REDIRECT = "dashboard",
}

export const LOGIN_LINK_SETTINGS = {
  password: process.env.LOGIN_LINKS_PASSWORD,
  ttl: 900, // In seconds, how long should login links be valid for
};

export const SESSION_SETTINGS = {
  password: process.env.SESSION_PASSWORD,
  ttl: 0, // We handle expiry
};

export const EMAILS = {
  SUPPORT: "support@plutomi.com",
  GENERAL: "contact@plutomi.com",
  INVEST: "ir@plutomi.com",
  ADMIN: "admin@plutomi.com",
  LOGIN: "login@plutomi.com", // Login links
  JOIN: "join@plutomi.com", // Org invites
};

/**
 * Properties that cannot be updated no matter the entity type once created
 * This is only for UpdateItem expressions and does not apply for transactions
 * like when a user joins an org, their orgId is updated then.
 * This prevents calling PUT /users/:userId with a new orgId
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
 * Global forbidden properties. Cannot be updated, regardless of entity
 * forbidden() blocks the key, except undefined. strip() removes it afterwards
 * sice we don't want it going to Dynamo as undefined
 * https://joi.dev/api/?v=15.1.1#anyforbidden
 * https://joi.dev/api/?v=15.1.1#anystrip
 */
export const JOI_GLOBAL_FORBIDDEN = {
  orgId: Joi.any().forbidden().strip(),
  PK: Joi.any().forbidden().strip(),
  SK: Joi.any().forbidden().strip(),
  ttlExpiry: Joi.any().forbidden().strip(),
  entityType: Joi.any().forbidden().strip(),
  createdAt: Joi.any().forbidden().strip(),
};

/**
 * Extra properties that cannot be updated per entity type
 */
export const FORBIDDEN_PROPERTIES = {
  /**
   * {@link DynamoNewApplicant}
   */
  APPLICANT: [
    ...GLOBAL_FORBIDDEN_PROPERTIES,
    "applicantId",
    "GSI1PK",
    "GSI1SK",
    "GSI2PK",
    "GSI2SK", // TODO, remove these when advancing / moving applicants!!!!!!!!!
  ],
  /**
   * {@link DynamoNewStage}
   */
  STAGE: [...GLOBAL_FORBIDDEN_PROPERTIES, "stageId", "openingId", "GSI1PK"],
  STAGE_QUESTION: [
    ...GLOBAL_FORBIDDEN_PROPERTIES,
    "questionId",
    "GSI1PK",
    "stageId",
  ],
};

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

// Schema to validate orgIds against in joi
export const JoiOrgId = Joi.string().invalid(
  DEFAULTS.NO_ORG,
  tagGenerator.generate(DEFAULTS.NO_ORG)
);

export const withDefaultMiddleware = [
  httpEventNormalizer({ payloadFormatVersion: 2 }),
  httpJsonBodyParser(),
  inputOutputLogger(),
  withCleanOrgId(),
  httpResponseSerializer(MIDDY_SERIALIZERS),
];

export const lambdaAuthorizerMiddleware = [
  httpEventNormalizer({ payloadFormatVersion: 2 }),
  /**
   * This middleware cannot be used because the Lambda authorizer
   * does not get the request body passed into it and therefore
   * it will throw an error
   * https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-lambda-authorizer-input.html
   */
  // httpJsonBodyParser(),
  inputOutputLogger(),
  withCleanOrgId(),
  // This isn't needed for the authorizer
  // httpResponseSerializer(MIDDY_SERIALIZERS),
];
