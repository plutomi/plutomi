// This file is for the actual DynamoDB entries and their Types - ie: A full object with all properties.
// All  other types are derivatives with Pick, Omit, etc.
import { DEFAULTS, Entities, OpeningState } from '../Config';

export enum DynamoIAM {
  DeleteItem = 'dynamodb:DeleteItem',
  GetItem = 'dynamodb:GetItem',
  BatchGetItem = 'dynamodb:BatchGetItem',
  Query = 'dynamodb:Query',
  PutItem = 'dynamodb:PutItem',
  UpdateItem = 'dynamodb:UpdateItem',
  BatchWriteItem = 'dynamodb:BatchWriteItem',
}

export type AllDynamoEntities =
  | DynamoOrgLoginEvent
  | DynamoUserLoginEvent
  | DynamoOrg
  | DynamoLoginLink
  | DynamoUser
  | DynamoWebhook
  | DynamoOrgInvite
  | DynamoOpening // TODO public variant
  | DynamoApplicantResponse
  | DynamoApplicant // TODO public variant
  | DynamoQuestion // TODO public variant?
  | DynamoQuestionStageAdjacentItem
  | DynamoStage; // TODO public variant

export interface DynamoStage {
  readonly PK: `${Entities.ORG}#${string}#${Entities.OPENING}#${string}${Entities.STAGE}#${string}`;
  readonly SK: Entities.STAGE;
  entityType: Entities.STAGE;
  createdAt: string;
  updatedAt: string;
  orgId: string;
  totalQuestions: number;
  questionOrder: string[]; // TODO remove for linked list
  stageId: string;
  totalApplicants: number;
  openingId: string;
  GSI1PK: `${Entities.ORG}#${string}#${Entities.OPENING}#${string}#${Entities.STAGE}S`;
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
  PK: `${Entities.ORG}#${string}#${Entities.QUESTION}#${string}`;
  SK: Entities.QUESTION;
  questionId: string;
  updatedAt: string;
  description?: string;
  orgId: string;
  entityType: Entities.QUESTION;
  createdAt: string;
  GSI1PK: `${Entities.ORG}#${string}#${Entities.QUESTION}S`;
  GSI1SK: string;
  totalStages: number;
}

export interface DynamoApplicant {
  PK: `${Entities.ORG}#${string}#${Entities.APPLICANT}#${string}`;
  SK: Entities.APPLICANT;
  firstName: string;
  lastName: string;
  canReceiveEmails: boolean;
  isEmailVerified: boolean;
  orgId: string;
  email: string;
  entityType: Entities.APPLICANT;
  createdAt: string;
  updatedAt: string;
  applicantId: string;
  openingId: string;
  stageId: string;
  unsubscribeKey: string;
  GSI1PK: `${Entities.ORG}#${string}#${Entities.OPENING}#${string}#${Entities.STAGE}#${string}`;
  GSI1SK: `DATE_LANDED#${string}`; // TODO ehh..
  applicantData: {}; // TODO ES
}

export interface DynamoApplicantResponse {
  PK: `${Entities.ORG}#${string}#${Entities.APPLICANT}#${string}`;
  SK: `${Entities.APPLICANT_RESPONSE}#${string}`;
  orgId: string;
  applicantId: string;
  entityType: Entities.APPLICANT_RESPONSE;
  createdAt: string;
  updatedAt: string;
  responseId: string;
  questionTitle: string;
  description: string;
  questionResponse: string;
  GSI1PK: `${Entities.ORG}#${string}#${Entities.APPLICANT}#${string}`;
  GSI1SK: Entities.APPLICANT_RESPONSE; // TODO add timestmap?
}
export interface DynamoOpening {
  PK: `${Entities.ORG}#${string}#${Entities.OPENING}#${string}`;
  SK: Entities.OPENING;
  orgId: string;
  entityType: Entities.OPENING;
  createdAt: string;
  updatedAt: string;
  stageOrder: string[];
  openingId: string;
  openingName: string;
  GSI1PK: `${Entities.ORG}#${string}#${Entities.OPENING}S`;
  GSI1SK: OpeningState;
  totalStages: number;
  totalApplicants: number;
}

export interface DynamoOrgInvite {
  PK: `${Entities.USER}#${string}`;
  SK: `${Entities.ORG_INVITE}#${string}`;
  orgId: string;
  orgName: string;
  createdBy: Pick<DynamoUser, 'firstName' | 'lastName' | 'orgId'>;
  recipient: Pick<DynamoUser, 'userId' | 'email' | 'unsubscribeKey' | 'firstName' | 'lastName'>;
  entityType: Entities.ORG_INVITE;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  inviteId: string;
  GSI1PK: `${Entities.ORG}#${string}#${Entities.ORG_INVITE}S`;
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
export interface DynamoUser {
  PK: `${Entities.USER}#${string}`;
  SK: Entities.USER;
  firstName: string | DEFAULTS.FIRST_NAME;
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

export interface DynamoLoginLink {
  PK: `${Entities.USER}#${string}`;
  SK: `${Entities.LOGIN_LINK}#${string}`;
  entityType: Entities.LOGIN_LINK;
  createdAt: string;
  updatedAt: string;
  user: DynamoUser;
  ttlExpiry: number;
  GSI1PK: `${Entities.USER}#${string}#${Entities.LOGIN_LINK}S`; // Get latest login link(s) for a user for throttling
  GSI1SK: string; // ISO timestamp
}

export interface DynamoOrg {
  PK: `${Entities.ORG}#${string}`;
  SK: Entities.ORG;
  orgId: string; // The actual org id
  entityType: Entities.ORG;
  createdAt: string; // ISO timestamp
  updatedAt: string;
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
