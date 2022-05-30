import { OpeningState } from '../Config';

/**
 * All possible parameters in the URL
 */
interface CustomQuery {
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

export interface UpdateApplicantOutput extends DynamoApplicant {
  responses: Object[]; // TODO fix this type with a response type
}
