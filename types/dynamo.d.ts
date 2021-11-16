// This file is for the actual DynamoDB entries and their Types - ie: A full object with all properties.
// All  other types are derivatives with Pick, Omit, etc.
import { ENTITY_TYPES } from "../defaults";

interface DynamoNewStage {
  /**
   * Primary key for creating a stage - takes `orgId` and `stageId`
   */
  PK: `${ENTITY_TYPES.ORG}#${string}#${ENTITY_TYPES.STAGE}#${string}`;
  /**
   * Sort key for a stage, it's just the {@link ENTITY_TYPES.STAGE}
   */
  SK: ENTITY_TYPES.STAGE;
  /**
   * The stage entity type {@link ENTITY_TYPES.STAGE}
   */
  entityType: ENTITY_TYPES.STAGE;
  /**
   * ISO timestamp of when the stage was created
   */
  createdAt: string;
  /**
   * The org this stage belongs to
   */
  orgId: string;
  /**
   * The order of the questions for the stage
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
   * The primary key to get all stages in an opening. Requires `orgId` and `openingId`
   */
  GSI1PK: `${ENTITY_TYPES.ORG}#${string}#${ENTITY_TYPES.OPENING}#${string}#${ENTITY_TYPES.STAGE}S`;
  /**
   * The stage name
   */
  GSI1SK: string;
}

interface DynamoNewStageQuestion {
  /**
   * The primary key for the question. Variables are `orgId` and `questionId`
   */
  PK: `${ENTITY_TYPES.ORG}#${string}#${ENTITY_TYPES.STAGE_QUESTION}#${string}`;
  /**
   * Sort key for the question. In this case, it's just the {@link ENTITY_TYPES.STAGE_QUESTION}
   */
  SK: ENTITY_TYPES.STAGE_QUESTION;
  /**
   * The ID of the question
   */
  questionId: string;
  /**
   * The description of the question
   * @default '' - Empty string
   */
  questionDescription: string;
  /**
   * Which org does this question belong to
   */
  orgId: string;

  /**
   * The entityType {@link ENTITY_TYPES.STAGE_QUESTION}
   */
  entityType: ENTITY_TYPES.STAGE_QUESTION;
  /**
   * ISO timestamp of when this question was created
   */
  createdAt: string;

  /**
   * Which stage does this question belong to
   */
  stageId: string;

  /**
   * The primary key for the questios GSI1, params are `orgId` and `stageId`
   */
  GSI1PK: `${ENTITY_TYPES.ORG}#${string}#${ENTITY_TYPES.STAGE}#${string}#QUESTIONS`;

  /**
   * The question title
   */
  GSI1SK: string;
}

interface DynamoNewApplicant {
  /**
   * Primary key of the applicant where the inputs are `orgId` and `applicantId`
   */
  PK: `${ENTITY_TYPES.ORG}#${string}#${ENTITY_TYPES.APPLICANT}#${string}`;
  /**
   * The {@link ENTITY_TYPES.APPLICANT}
   */
  SK: ENTITY_TYPES.APPLICANT;
  /**
   * First name of the applicant
   * @default - {@link PLACEHOLDERS.FIRST_NAME}
   */
  firstName: string;
  /**
   * Last name of the applicant
   * @default - {@link PLACEHOLDERS.LAST_NAME}
   *
   * */
  lastName: string;
  /**
   * Full name of the applicant. Concatenated `firstName` and `lastName`
   * @default - {@link PLACEHOLDERS.FULL_NAME}
   */
  fullName: `${string} ${string}`;

  /**
   * If the applicant's email has been verified (clicked on the application link sent to their email // TODO maybe answered questions on one stage?)
   */
  isemailVerified: boolean;
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
  entityType: ENTITY_TYPES.APPLICANT;
  /**
   * When this applicant was created
   */
  createdAt: string;
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
  // The reason for the below is so we can get applicants in an org, in an opening, or in a specific stage just by the ID of each.
  // Before we had `OPENING#${openingId}#STAGE#{stageId}` for the SK which required the opening when getting applicants in specific stage
  // TODO recheck later if this is still good

  /**
   * Key for returning all applicants in an org - `orgId`
   */
  GSI1PK: `${ENTITY_TYPES.ORG}#${string}#${ENTITY_TYPES.APPLICANT}S`;
  /**
   * Sort Key for returning all applicants that landed at X time in this opening - `orgId` and the current time
   */
  GSI1SK: `${ENTITY_TYPES.OPENING}#${string}#DATE_LANDED#${string}`;
  /**
   * Key for returning all applicants in an org - While this is a duplicate, it is to facilitate the query for stages
   */
  GSI2PK: `${ENTITY_TYPES.ORG}#${string}#${ENTITY_TYPES.APPLICANT}S`;
  /**
   * Sort Key for returning all applicants that landed at X time in this stage
   */
  GSI2SK: `${ENTITY_TYPES.STAGE}#${string}#DATE_LANDED#${string}`;
}

interface DynamoNewApplicantResponse {
  /**
   * The primary key for the response - needs an `orgId` and `applicantId`
   */
  PK: `${ENTITY_TYPES.ORG}#${string}#${ENTITY_TYPES.APPLICANT}#${string}`;
  /**
   * The sort key for the response - needs `responseId`
   */
  SK: `${ENTITY_TYPES.APPLICANT_RESPONSE}#${string}`;
  /**
   * The orgId this applicant response belongs to
   */
  orgId: string;
  /**
   * The ID of the applicant who responded
   */
  applicantId: string;
  /**
   * The entity of the response {@link ENTITY_TYPES.APPLICANT_RESPONSE}
   */
  entityType: ENTITY_TYPES.APPLICANT_RESPONSE;
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
  GSI1PK: `${ENTITY_TYPES.ORG}#${string}#${ENTITY_TYPES.APPLICANT}#${string}`;
  /**
   * Sort key to retrieve all responses for an applicant
   */
  GSI1SK: ENTITY_TYPES.APPLICANT_RESPONSE; // TODO add timestmap?
}
