import { EntityManager, MongoDriver } from '@mikro-orm/mongodb';
import { User } from '../entities';
import { DynamoApplicant } from './dynamo';

/**
 * All possible parameters in the URL
 */ // TODO use url path params
export interface CustomQuery {
  orgId: string;
  openingId: string;
  userId: string;
  stageId: string;

  applicantId: string;
  /**
   * The token to for the {@link Entities.LOGIN_LINK} that contains the user id
   */
  token: string;
  callbackUrl: string;
  questionId: string;
  inviteId: string;
}

// TODO types for files, etc.
export interface GetApplicantByIdOutput extends DynamoApplicant {
  responses: Object[]; // TODO fix this type with a response type
}

// TODO fix this type and add it to the response
export interface APIErrorResponse {
  message: string;
}

declare global {
  namespace Express {
    export interface Request {
      user: User;
      entityManager: EntityManager<MongoDriver>;
    }
  }
}

export enum IndexedEntities {
  User = 'User',
  Org = 'Org',
  OrgInvite = 'OrgInvite',
  Opening = 'Opening',
  OpeningState = 'OpeningState',
  Stage = 'Stage',
  UserLoginLink = 'UserLoginLink',
  Question = 'Question',
  Webhook = 'Webhook',
  Email = 'Email',
  CreatedBy = 'CreatedBy',
  PreviousStage = 'PreviousStage',
  NextStage = 'NextStage',
}

export type IndexIdTypes = string | null;
export type IndexedTargetArrayItem = { id: IndexIdTypes; type: IndexedEntities };
export type IndexedTargetArray = Array<IndexedTargetArrayItem>;
