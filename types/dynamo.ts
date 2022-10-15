// This file is for the actual DynamoDB entries and their Types - ie: A full object with all properties.
// All  other types are derivatives with Pick, Omit, etc.
import { DEFAULTS, Entities, OpeningState } from '../Config';
import { Opening, Stage } from '../entities';

export enum DynamoIAM {
  DeleteItem = 'dynamodb:DeleteItem',
  GetItem = 'dynamodb:GetItem',
  BatchGetItem = 'dynamodb:BatchGetItem',
  Query = 'dynamodb:Query',
  PutItem = 'dynamodb:PutItem',
  UpdateItem = 'dynamodb:UpdateItem',
  BatchWriteItem = 'dynamodb:BatchWriteItem',
}

export type AllEntities =
  | DynamoOrgLoginEvent
  | DynamoUserLoginEvent
  | DynamoOrg // ! Done
  | DynamoLoginLink // ! Done
  | DynamoUser // ! Done
  | DynamoWebhook
  | DynamoOrgInvite
  | DynamoOpening // TODO public variant
  | DynamoApplicantResponse
  | DynamoApplicant // TODO public variant
  | DynamoQuestion // TODO public variant?
  | DynamoQuestionStageAdjacentItem
  | DynamoStage // !Done
  | Opening
  | Stage;
// TODO public variant

export interface DynamoStage {
  /**
   * Primary key for creating a stage - takes `orgId`, `openingId`, & `stageId`
   */
  readonly PK: `${Entities.ORG}#${string}#${Entities.OPENING}#${string}${Entities.STAGE}#${string}`;
  /**
   * Sort key for a stage, it's just the {@link Entities.STAGE}
   */
  readonly SK: Entities.STAGE;
  /**
   * The stage entity type {@link Entities.STAGE}
   */
  entityType: Entities.STAGE;
  /**
   * ISO timestamp of when the stage was created
   */
  createdAt: string;
  updatedAt: string;
  /**
   * The org this stage belongs to
   */
  orgId: string;

  totalQuestions: number;

  /**
   * An array of questionIds in the order that the  questions should show up
   */
  questionOrder: string[];
  /**
   * The Id for the stage
   */
  stageId: string;
  /**
   * How many applicants are in the stage, updated in a transaction so it's always accurate
   */
  totalApplicants: number;
  /**
   * The opening this stage belongs to
   */
  openingId: string;
  /**
   * The index key to get all stages in an opening. Requires `orgId` and `openingId`
   */
  GSI1PK: `${Entities.ORG}#${string}#${Entities.OPENING}#${string}#${Entities.STAGE}S`;
  /**
   * The stage name
   */
  GSI1SK: string;
}

export interface DynamoQuestionStageAdjacentItem {
  PK: `${Entities.ORG}#${string}#${Entities.QUESTION}#${string}`;
  SK: `${Entities.QUESTION_ADJACENT_STAGE_ITEM}#${Entities.OPENING}#${string}#${Entities.STAGE}#${string}`;
  entityType: Entities.QUESTION_ADJACENT_STAGE_ITEM;
  createdAt: string;
  updatedAt: string;
  orgId: string;
  openingId: string;
  stageId: string;
  questionId: string;
}

export interface DynamoQuestion {
  /**
   * The primary key for the question. Variables are `orgId` and `questionId`
   */
  PK: `${Entities.ORG}#${string}#${Entities.QUESTION}#${string}`;
  /**
   * Sort key for the question. In this case, it's just the {@link Entities.QUESTION}
   */
  SK: Entities.QUESTION;
  /**
   * The custom ID of the question, where rules will be evaluated agains
   */
  questionId: string;
  updatedAt: string;

  /**
   * The description of the question
   * @optional
   * @default ''
   *
   */
  description?: string;
  /**
   * Which org does this question belong to
   */
  orgId: string;

  /**
   * The entityType {@link Entities.QUESTION}
   */
  entityType: Entities.QUESTION;
  /**
   * ISO timestamp of when this question was created
   */
  createdAt: string;

  /**
   * Get all questions in org & get question by key
   */
  GSI1PK: `${Entities.ORG}#${string}#${Entities.QUESTION}S`;

  /**
   * The question Title
   */
  GSI1SK: string;

  /**
   * How many stages this question is attached to
   */
  totalStages: number;
}

export interface DynamoApplicant {
  /**
   * Primary key of the applicant where the inputs are `orgId` and `applicantId`
   */
  PK: `${Entities.ORG}#${string}#${Entities.APPLICANT}#${string}`;
  /**
   * The {@link Entities.APPLICANT}
   */
  SK: Entities.APPLICANT;
  /**
   * First name of the applicant
   * @default - {@link DEFAULTS.FIRST_NAME}
   */
  firstName: string;
  /**
   * Last name of the applicant
   * @default - {@link DEFAULTS.LAST_NAME}
   *
   * */
  lastName: string;

  /**
   * If an applicant has unsubscribed from emails
   */
  canReceiveEmails: boolean;
  /**
   * If the applicant's email has been verified
   */
  isEmailVerified: boolean;
  /**
   * The org this applicant belongs to
   */
  orgId: string;
  /**
   * The applicant's email address
   */
  email: string;
  /**
   * The entity type of the applicant
   */
  entityType: Entities.APPLICANT;
  /**
   * When this applicant was created
   */
  createdAt: string;
  updatedAt: string;
  /**
   * ID of the applicant
   */
  applicantId: string;
  // TODO add phone number
  /**
   * Which `opening` this applicant should be created in
   */
  openingId: string;
  /**
   * Which `stage` this applicant should be created in
   */
  stageId: string;
  /**
   * The key to unsubscribe this applicant from emails -
   * TODO when adding login portal (one applicant, many applications across orgs)
   * this can be set at the applicant level
   */
  unsubscribeKey: string;
  /**
   * The current opening and stage the applicant is in
   */
  GSI1PK: `${Entities.ORG}#${string}#${Entities.OPENING}#${string}#${Entities.STAGE}#${string}`;
  /**
   * The date the applicant landed on this stage - ISO timestamp
   */
  GSI1SK: `DATE_LANDED#${string}`; // TODO ehh..

  applicantData: {}; // TODO ES
}

export interface DynamoApplicantResponse {
  /**
   * The primary key for the response - needs an `orgId` and `applicantId`
   */
  PK: `${Entities.ORG}#${string}#${Entities.APPLICANT}#${string}`;
  /**
   * The sort key for the response - needs `responseId`
   */
  SK: `${Entities.APPLICANT_RESPONSE}#${string}`;
  /**
   * The orgId this applicant response belongs to
   */
  orgId: string;
  /**
   * The ID of the applicant who responded
   */
  applicantId: string;
  /**
   * The entity of the response {@link Entities.APPLICANT_RESPONSE}
   */
  entityType: Entities.APPLICANT_RESPONSE;
  /**
   * The ISO timestamp of when the response was created
   */
  createdAt: string;
  updatedAt: string;
  /**
   * The ID of the response
   */
  responseId: string;
  /**
   * The Title of the question for which the response is for
   */
  questionTitle: string;
  /**
   * The description of the question for which the response is for
   */
  description: string;
  /**
   * The actual response to the question
   */
  questionResponse: string;
  /**
   * Primary key to retrieve all responses for an applicant - takes `orgId` and `applicantId`
   */
  GSI1PK: `${Entities.ORG}#${string}#${Entities.APPLICANT}#${string}`;
  /**
   * Sort key to retrieve all responses for an applicant
   */
  GSI1SK: Entities.APPLICANT_RESPONSE; // TODO add timestmap?
}
export interface DynamoOpening {
  /**
   * Primary key for creating an opening. Takes an `orgId`
   */
  PK: `${Entities.ORG}#${string}#${Entities.OPENING}#${string}`;
  /**
   * {@link Entities.OPENING}
   */
  SK: Entities.OPENING;

  /**
   * The org this opening belongs to
   */

  orgId: string;
  /**
   * {@link Entities.OPENING}
   */
  entityType: Entities.OPENING;
  /**
   * ISO Timestamp of when the opening was created
   */
  createdAt: string;
  updatedAt: string;
  /**
   * The order of the stages in this opening
   */
  stageOrder: string[];
  /**
   * The ID of the opening
   */
  openingId: string;

  /**
   * The opening name
   */
  openingName: string;
  /**
   * GSIPK to retrieve all openings in an org. Takes an `orgId`
   */
  GSI1PK: `${Entities.ORG}#${string}#${Entities.OPENING}S`;
  /**
   * Optional, can filter out PUBLIC or PRIVATE openings
   */
  GSI1SK: OpeningState;
  /**
   * Total stages in opening.
   * @default 0
   */
  totalStages: number;
  /**
   *
   *  Total applicants in opening.
   * @default 0
   */
  totalApplicants: number;
}

export interface DynamoOrgInvite {
  /**
   * Primary key, requires a `userId`
   */
  PK: `${Entities.USER}#${string}`;
  /**
   * Sort key, takes in an `inviteId`
   */
  SK: `${Entities.ORG_INVITE}#${string}`;
  /**
   * The orgId this invite is for
   */
  orgId: string;
  /**
   * The actual name of the org to show on the invite
   */
  orgName: string;
  /**
   * Who created this invite, info comes from their session
   */
  createdBy: Pick<DynamoUser, 'firstName' | 'lastName' | 'orgId'>;

  recipient: Pick<DynamoUser, 'userId' | 'email' | 'unsubscribeKey' | 'firstName' | 'lastName'>;
  /**
   * The entity type, see {@link Entities.ORG_INVITE}
   */
  entityType: Entities.ORG_INVITE;
  /**
   * ISO string timestamp of when this invite was created
   */
  createdAt: string;
  updatedAt: string;
  /**
   * ISO string timestamp of when this invite becomes invalid
   */
  expiresAt: string;
  /**
   * The invite's id
   */
  inviteId: string;
  /**
   * PK for the GSI, takes an 'orgId' to be able to retrieve all invites for an org
   */
  GSI1PK: `${Entities.ORG}#${string}#${Entities.ORG_INVITE}S`;
  /**
   * Current ISO timestamp, same as when createdAt
   */
  GSI1SK: string;
}

export interface DynamoWebhook {
  PK: `${Entities.ORG}#${string}#${Entities.WEBHOOK}#${string}`;
  SK: string;
  orgId: string;
  webhookName: string;
  webhookId: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  webhookUrl: string;
  entityType: Entities.WEBHOOK;
  GSI1PK: `${Entities.ORG}#${string}#${Entities.WEBHOOK}S`;
  GSI1SK: string;
}

// ! DONE
export interface DynamoUser {
  PK: `${Entities.USER}#${string}`;
  SK: Entities.USER;
  /**
   * The given `firstName`
   * @default DEFAULTS.FIRST_NAME
   */
  firstName: string | DEFAULTS.FIRST_NAME;
  /**
   * The given `lastName`
   * @default DEFAULTS.LAST_NAME
   */
  lastName: string | DEFAULTS.LAST_NAME;
  email: string;
  userId: string;
  entityType: Entities.USER;
  createdAt: string;
  updatedAt: string;
  orgId: DEFAULTS.NO_ORG;
  orgJoinDate: DEFAULTS.NO_ORG;
  GSI1PK: `${Entities.ORG}#${DEFAULTS.NO_ORG}#${Entities.USER}S`;
  GSI1SK: string; // first & last name
  GSI2PK: string;
  GSI2SK: Entities.USER;
  unsubscribeKey: string;
  canReceiveEmails: boolean;
  verifiedEmail: boolean;
  totalInvites: number;
}

// ! DONE

export interface DynamoLoginLink {
  PK: `${Entities.USER}#${string}`;
  SK: `${Entities.LOGIN_LINK}#${string}`;
  entityType: Entities.LOGIN_LINK;
  createdAt: string;
  updatedAt: string;
  user: DynamoUser;
  /**
   * A UNIX date for which Dynamo will auto delete this link
   */
  ttlExpiry: number;
  GSI1PK: `${Entities.USER}#${string}#${Entities.LOGIN_LINK}S`; // Get latest login link(s) for a user for throttling
  GSI1SK: string; // ISO timestamp
}

// ! DONE

export interface DynamoOrg {
  PK: `${Entities.ORG}#${string}`;
  SK: Entities.ORG;
  orgId: string; // The actual org id
  entityType: Entities.ORG;
  createdAt: string; // ISO timestamp
  updatedAt: string;
  /**
   * userId of the user who created the org
   */
  createdBy: string;
  totalApplicants: number;
  totalOpenings: number;
  totalUsers: number;
  totalWebhooks: number;
  displayName: string;
  totalQuestions: number;
}

export interface DynamoUserLoginEvent {
  PK: `${Entities.USER}#${string}`;
  SK: `${Entities.USER_LOGIN_EVENT}#${string}`;
  createdAt: string; // ISO timestamp
  updatedAt: string;
  orgId: string;
  ttlExpiry: number; // ttl unix expiry
  entityType: Entities.USER_LOGIN_EVENT;
  user: DynamoUser;
}

export interface DynamoOrgLoginEvent {
  PK: `${Entities.ORG}#${string}`;
  SK: `${Entities.ORG_LOGIN_EVENT}#${string}`;
  // TODO user info here
  // TODO in the future, get more the info about the login event such as IP, headers, device, etc.
  createdAt: string;
  orgId: string;
  updatedAt: string;
  ttlExpiry: number;
  entityType: Entities.ORG_LOGIN_EVENT;
}
