import Joi from 'joi';
import axios from 'axios';
import TagGenerator from './utils/tagGenerator';
import { env } from './env';
/**
 * Some backend dependencies (SES, ACM, Route53, etc..) depend on
 * DOMAIN_NAME being the actual domain name, do not change!
 */

export const DOMAIN_NAME = `plutomi.com`; // TODO move this to deplo ycommand???
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export const EXPRESS_PORT = 3000;

export let WEBSITE_URL = `http://localhost:3000`;

// CANNOT USE `env` util!!!!!!! Will get passed in the github action as config is called first
if (process.env.NEXT_PUBLIC_WEBSITE_URL) {
  console.log(
    'NEXT_PUBLIC_WEBSITE_URL FOUND, setting WEBSITE_URL to',
    process.env.NEXT_PUBLIC_WEBSITE_URL,
  );
  WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL;
}

console.log('URL INIT DONE', WEBSITE_URL);

export const API_URL = `${WEBSITE_URL}/api`;
console.log('API URL', API_URL);
//
export const COOKIE_NAME = env.nodeEnv === 'production' ? 'plutomi-cookie' : 'DEV-plutomi-cookie';

console.log('CONFIG setup done');
export enum OpeningState {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

export const DYNAMO_TABLE_NAME = 'Plutomi';

export enum Entities {
  APPLICANT = 'APPLICANT',
  APPLICANT_RESPONSE = 'APPLICANT_RESPONSE',
  ORG = 'ORG',
  ORG_INVITE = 'ORG_INVITE',
  USER = 'USER',
  OPENING = 'OPENING',
  STAGE = 'STAGE',
  QUESTION = 'QUESTION',
  // For keeping track of how many stages a question is in, see
  QUESTION_ADJACENT_STAGE_ITEM = 'QUESTION_ADJACENT_STAGE_ITEM',
  STAGE_RULE = 'STAGE_RULE',
  LOGIN_LINK = 'LOGIN_LINK',
  USER_LOGIN_EVENT = 'USER_LOGIN_EVENT',
  ORG_LOGIN_EVENT = 'ORG_LOGIN_EVENT',
  WEBHOOK = 'WEBHOOK',
}

export enum TIME_UNITS {
  MILLISECONDS = 'milliseconds',
  SECONDS = 'seconds',
  MINUTES = 'minutes',
  HOURS = 'hours',
  DAYS = 'days',
  WEEKS = 'weeks',
  MONTHS = 'months',
  YEARS = 'years',
}

export const ERRORS = {
  NOT_SAME_ORG: 'You must belong to this org to perform that action',
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
  FIRST_NAME = 'NO_FIRST_NAME',
  LAST_NAME = 'NO_LAST_NAME',
  NO_ORG = `NO_ORG_ASSIGNED`,
  /**
   * When no callbackUrl is provided on login, what page should users be redirected to
   */
  REDIRECT = 'dashboard', // TODO make this an enum / typ;e
}

export enum LIMITS {
  MAX_OPENING_NAME_LENGTH = 100,
  MAX_STAGE_NAME_LENGTH = 100,
  MAX_QUESTION_TITLE_LENGTH = 100,
  MAX_QUESTION_DESCRIPTION_LENGTH = 500,
  MAX_APPLICANT_FIRSTNAME_LENGTH = 20,
  MAX_APPLICANT_LASTNAME_LENGTH = 20,
  MAX_WEBHOOK_DESCRIPTION_LENGTH = 300,

  /**
   * How many child items (that can be re-ordered!) is a parent allowed to have.
   * Stages in an opening, rules / questions in a stage.
   */
  MAX_CHILD_ITEM_LIMIT = 200,
}

export enum DynamoStreamTypes { // TODO possible default type in Dynamo?
  INSERT = 'INSERT',
  MODIFY = 'MODIFY',
  REMOVE = 'REMOVE',
}

export enum Emails {
  SUPPORT = 'support@plutomi.com',
  GENERAL = 'contact@plutomi.com',
  INVEST = 'ir@plutomi.com',
  ADMIN = 'admin@plutomi.com',
  LOGIN = 'login@plutomi.com', // Login links
  JOIN = 'join@plutomi.com', // Org invites
  JOSE = 'jose@plutomi.com', // Welcome messages
  // Jest test accounts
  TESTING = 'testing@plutomi.com',
  TESTING2 = 'testing2@plutomi.com',
  TESTING3 = 'testing3@plutomi.com',
  TESTING4 = 'testing4@plutomi.com',
}

export const JOI_SETTINGS: Joi.ValidationOptions = {
  abortEarly: false,
  stripUnknown: true,
};

console.log(`Setting axios instance with API url`, API_URL);
export const AXIOS_INSTANCE = axios.create({
  withCredentials: true,
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const SWRFetcher = (url: string) =>
  AXIOS_INSTANCE.get(API_URL + url).then((res) => res.data);

export type NavbarItem = {
  // TODO move this type out of here into the actual navbar
  /**
   * The name of the navbar item such as 'Dashboard' or 'Questions'
   */
  name: string;
  /**
   * The path of the page such as '/dashboard' or '/questions'
   */
  href: string;
  /**
   * If this item should be hidden when a user is not in an org.
   */
  hiddenIfNoOrg: boolean;
  /**
   * If this item should be hidden if a user is in an org.  Usually false, but
   * used for things like Invites in which a user shouldn't be accepting invites
   * while tey are already in an org
   */
  hiddenIfOrg: boolean;
};

// TODO move this out of here lol
export const NAVBAR_NAVIGATION: NavbarItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    hiddenIfNoOrg: false,
    hiddenIfOrg: false,
  },
  {
    name: 'Openings',
    href: '/openings',
    hiddenIfNoOrg: true,
    hiddenIfOrg: false,
  },
  {
    name: 'Questions',
    href: '/questions',
    hiddenIfNoOrg: true,
    hiddenIfOrg: false,
  },
  { name: 'Team', href: '/team', hiddenIfNoOrg: true, hiddenIfOrg: false },
  {
    name: 'Invites',
    href: '/invites',
    hiddenIfNoOrg: false,
    hiddenIfOrg: true,
  },
  {
    name: 'Webhooks',
    href: '/webhooks',
    hiddenIfNoOrg: true,
    hiddenIfOrg: false,
  },
];
// TODO move this out of here
export const DROPDOWN_NAVIGATION = [
  { name: 'Your Profile', href: '/profile' },
  { name: 'Log Out', href: '#' },
];

// Schema to validate orgIds against in joi
export const JoiOrgId = Joi.string()
  .invalid(
    DEFAULTS.NO_ORG,
    TagGenerator({
      value: DEFAULTS.NO_ORG,
    }),
    'plutomi',
    'plutomi-',
    'plutomi-inc',
    'plutomiinc',
    'api', // For express server, although the route will catch it first
  )
  .max(100);

// If not specified, how long should invites be valid for
export const ORG_INVITE_EXPIRY_DAYS = 3;

export const COOKIE_SETTINGS = {
  httpOnly: true,
  sameSite: true, // (same as strict)
  secure: true,
  maxAge: 1000 * 60 * 60 * 12, // 12 hours
  signed: true,
};
