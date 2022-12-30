import Joi from 'joi';
import axios from 'axios';
import { envVars } from './env';

export const IS_STAGE = envVars.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT === 'stage';
export const IS_PROD = envVars.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT === 'prod';
export const IS_LIVE = IS_STAGE || IS_PROD;

/**
 * ! Some backend dependencies (SES, ACM, Route53, etc..) depend on
 * ! DOMAIN_NAME being the actual domain name, do not change!
 */
export const DOMAIN_NAME = `plutomi.com`;
export const STAGE_DOMAIN_NAME = `stage.plutomi.com`;

const getWebsiteUrl = () => {
  if (IS_LIVE) return `https://${IS_PROD ? DOMAIN_NAME : STAGE_DOMAIN_NAME}`;
  return `http://localhost:${envVars.PORT}`;
};
export const WEBSITE_URL = getWebsiteUrl();

export const API_URL = `${IS_STAGE ? STAGE_DOMAIN_NAME : DOMAIN_NAME}/api`;

// TODO replace with next-auth
const getCookieName = () => {
  if (IS_PROD) return 'plutomi-cookie';
  if (IS_STAGE) return 'stage-plutomi-cookie';
  return 'dev-plutomi-cookie';
};
export const COOKIE_NAME = getCookieName();

console.log('EXPRESS APP STARTING, CONFIG', envVars);

// TODO move this out
export enum OpeningState {
  Public = 'Public',
  Private = 'Private',
}

// TODO use dayjs type
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

export enum Collections {
  Orgs = 'Orgs',
  Applicants = 'Applicants',
  Questions = 'Questions',
  Stages = 'Stages',
  Users = 'Users',
  Webhooks = 'Webhooks',
  LoginLinks = 'LoginLinks',
  Openings = 'Openings',
  Invites = 'Invites',
  StageQuestionItem = 'StageQuestionItem',
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

export enum Defaults {
  /**
   * When no callbackUrl is provided on login, what page should users be redirected to
   */
  Redirect = 'dashboard', // TODO make this an enum / typ;e
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

export enum Emails {
  Support = 'support@plutomi.com',
  General = 'contact@plutomi.com',
  Invest = 'ir@plutomi.com',
  Admin = 'admin@plutomi.com',
  Login = 'login@plutomi.com', // Login links
  Join = 'join@plutomi.com', // Org invites
  Jose = 'jose@plutomi.com', // Welcome messages
  // Jest test accounts
  Testing = 'testing@plutomi.com',
  Testing2 = 'testing2@plutomi.com',
  Testing3 = 'testing3@plutomi.com',
  Testing4 = 'testing4@plutomi.com',
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

export const Servers = {
  // Fargate task count
  count: { min: 1, max: 2 },
  // FargateTaskDefinitionProps.cpu?
  cpu: 256,
  // In mb, how much memory
  memory: 512,

  targetUtilizationPct: 15,

  // Per 5 minutes
  rateLimit: {
    web: 2000,
    api: 1000,
  },

  vpc: {
    az: 3,
    natGateways: 0,
  },
};

export const NOT_SET = 'NOT_SET';

export enum Policies {
  SendEmail = 'ses:SendEmail',
  SendRawEmail = 'ses:SendRawEmail',
  SendTemplatedEmail = 'ses:SendTemplatedEmail',
}
