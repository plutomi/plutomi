import { UserEntity } from '../models';

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
      user: UserEntity;
    }
  }
}
