import { EntityTypes } from "./additional";

export interface ApplicantDynamoEntry {
  /**
   * Primary key of the applicant where the inputs are `orgId` and `applicantId`
   */
  PK: `ORG#${string}#APPLICANT#${string}`;
  /**
   * The {@link EntityTypes.APPLICANT}
   */
  SK: EntityTypes.APPLICANT;
  /**
   * First name of the applicant
   * @default - NO_FIRST_NAME
   */
  firstName: string;
  /**
   * Last name of the applicant
   * @default - NO_LAST_NAME
   *
   * */
  lastName: string;
  /**
   * Full name of the applicant. Concatenated `firstName` and `lastName`
   */
  fullName: `${string} ${string}`;

  /**
   * If the applicant's email has been verified (clicked on the application link sent to their email // TODO maybe answered questions on one stage?)
   */
  isApplicantEmailVerified: boolean;
  /**
   * The org this applicant belongs to
   */
  orgId: string;
  /**
   * The applicant's email address
   */
  applicantEmail: string;
  /**
   * The entity type of the applicant
   */
  entityType: EntityTypes.APPLICANT;
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
  stageId: stageId;
  // The reason for the below is so we can get applicants in an org, in an opening, or in a specific stage just by the ID of each.
  // Before we had `OPENING#${openingId}#STAGE#{stageId}` for the SK which required the opening when getting applicants in specific stage
  // TODO recheck later if this is still good

  /**
   * Key for returning all applicants in an org - `orgId`
   */
  GSI1PK: `ORG#${string}#APPLICANTS`;
  /**
   * Sort Key for returning all applicants that landed at X time in this opening - `orgId` and the current time
   */
  GSI1SK: `OPENING#${string}#DATE_LANDED#${string}`;
  /**
   * Key for returning all applicants in an org - While this is a duplicate, it is to facilitate the query for stages
   */
  GSI2PK: `ORG#${string}#APPLICANTS`;
  /**
   * Sort Key for returning all applicants that landed at X time in this stage
   */
  GSI2SK: `STAGE#${string}#DATE_LANDED#${string}`;
}

interface GetApplicantByIdInput {
  /**
   * The orgId the applicant is in
   */
  orgId: string;
  /**
   * The applicant's id
   */
  applicantId: string;
}

// TODO types for files, etc.
interface GetApplicantByIdOutput extends CreateApplicantDynamoEntry {
  responses: Object[]; // TODO fix this type with a response type
}

interface DeleteApplicantInput {
  /**
   * Id of the org in which the applicant is in
   */
  orgId: string;
  /**
   * Id of the applicant
   */
  applicantId: string;
}

export interface CreateQuestionInput {
  /**
   * Which org does this question belong to
   */
  orgId: string;

  /**
   * Which stage does this question belong to
   */
  stageId: string;

  /**
   * The question title
   */
  GSI1SK: string;

  /**
   * The question description
   */
  questionDescription: questionDescription;
}

type CreateApplicantInput = Pick<
  ApplicantDynamoEntry,
  | "orgId"
  | "firstName"
  | "lastName"
  | "applicantEmail"
  | "openingId"
  | "stageId"
>;

type CreateApplicantOutput = ApplicantDynamoEntry;
