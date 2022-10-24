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

// TODO fix this type and add it to the response
export interface APIErrorResponse {
  message: string;
}

declare global {
  namespace Express {
    export interface Request {
      user: {}; // TODO types
    }
  }
}

export enum Collections {
  Orgs = 'Orgs',
  Applicants = 'Applicants',
  Questions = 'Questions',
  Stages = 'Stages',
  Users = 'Users',
  Webhooks = 'Webhooks',
  LoginLinks = 'LoginLinks',
  Openings = 'Opening',
}

export enum IdxTypes {
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
  Id = 'Id',
}

export type IndexIdTypes = string | null;
export type IndexedTargetArrayItem = { type: IdxTypes; value: IndexIdTypes };
export type IndexedTargetArray = Array<IndexedTargetArrayItem>;
