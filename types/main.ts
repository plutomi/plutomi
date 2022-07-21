import { DynamoApplicant, DynamoUser } from './dynamo';

/**
 * All possible parameters in the URL
 */
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

export interface APIErrorResponse {
  message: string;
}
declare global {
  namespace Express {
    export interface Request {
      user: DynamoUser;
    }
  }
}
