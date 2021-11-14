import { EntityTypes } from "./additional";

export interface ApplicantResponseEntry {
  /**
   * The primary key for the response - needs an `orgId` and `applicantId`
   */
  PK: `ORG#${string}#APPLICANT#${string}`;
  /**
   * The sort key for the response - needs `responseId`
   */
  SK: `${EntityTypes.APPLICANT_RESPONSE}#${string}`;
  /**
   * The orgId this applicant response belongs to
   */
  orgId: string;
  /**
   * The ID of the applicant who responded
   */
  applicantId: string;
  /**
   * The entity of the response {@link EntityTypes.APPLICANT_RESPONSE}
   */
  entityType: EntityTypes.APPLICANT_RESPONSE;
  /**
   * The ISO timestamp of when the response was created
   */
  createdAt: string;
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
  questionDescription: string;
  /**
   * The actual response to the question
   */
  questionResponse: string;
  /**
   * Primary key to retrieve all responses for an applicant - takes `orgId` and `applicantId`
   */
  GSI1PK: `ORG#${string}#APPLICANT#${string}`;
  /**
   * Sort key to retrieve all responses for an applicant
   */
  GSI1SK: EntityTypes.APPLICANT_RESPONSE; // TODO add timestmap?
}

type CreateApplicantResponseInput = Pick<
  ApplicantResponseEntry,
  | "orgId"
  | "applicantId"
  | "questionTitle"
  | "questionDescription"
  | "questionResponse"
>;

type CreateApplicantResponseOutput = ApplicantResponseEntry;
