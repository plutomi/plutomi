type CreateApplicantAPIBody = CreateApplicantInput;
interface CreateApplicantAPIResponse {
  message: string;
}

/**
 * All possible parameters in the URL
 */

interface CUSTOM_QUERY {
  /**
   * Id of the org
   */
  orgId: string;
  /**
   * Id of the opening
   */
  openingId: string;
  /**
   * Id of the user
   */
  userId: string;
  /**
   * Id of the stage
   */
  stageId: string;
  /**
   * Id of the applicant
   */
  applicantId: string;
  /**
   * The key to for the LOGIN_LINKS that allow it to be used
   */
  key: string;
  /**
   * The callback url
   */
  callbackUrl: string;
  /**
   * Id for the question
   */
  questionId: string;
  /**
   * Id for the invite
   */
  inviteId: string;
}

declare enum ENTITY_TYPES {
  /**
   * For applicants
   */
  APPLICANT = "APPLICANT",

  /**
   * For applicant responses to a `STAGE_QUESTION`
   */
  APPLICANT_RESPONSE = "APPLICANT_RESPONSE",
  /**
   * For organizations
   */
  ORG = "ORG",

  /**
   * Invites to join an organization
   */
  ORG_INVITE = "ORG_INVITE",

  /**
   * For users of the service
   */
  USER = "USER",

  /**
   * For openings inside an `ORG`
   */
  OPENING = "OPENING",

  /**
   * For stages inside an `ORG`
   */
  STAGE = "STAGE",

  /**
   * For questions inside of a `STAGE`
   */
  STAGE_QUESTION = "STAGE_QUESTION",

  /**
   * For rules inside of a `STAGE`
   */
  STAGE_RULE = "STAGE_RULE",

  /**
   * Login links for `USER`s
   */
  LOGIN_LINK = "LOGIN_LINK",
}

declare enum TIME_UNITS {
  MILLISECONDS = "milliseconds",
  SECONDS = "seconds",
  MINUTES = "minutes",
  HOURS = "hours",
  DAYS = "days",
  WEEKS = "weeks",
  MONTHS = "months",
  YEARS = "years",
}

declare enum LIMITS {
  MAX_CHILD_ITEM_LIMIT = 200,
}

declare enum ERRORS {
  MAX_CHILD_ITEM_LIMIT_ERROR_MESSAGE = `MAX_CHILD_ITEM_LIMIT reached, please contact support@plutomi.com for assistance`,
  INVALID_DATE_ERROR = `The date you provided appears to be invalid`,
}

declare enum ID_LENGTHS {
  USER = 42,
  APPLICANT = 60,
  INVITE = 50,
  OPENING = 16,
  STAGE = 50,
  STAGE_QUESTION = 50,
  STAGE_RULE = 16,
}

declare enum DEFAULT_VALUES {
  FIRST_NAME = "NO_FIRST_NAME",
  LAST_NAME = "NO_LAST_NAME",
  FULL_NAME = `NO_FIRST_NAME NO_LAST_NAME`,
  NO_ORG = `NO_ORG_ASSIGNED`,
}

declare enum CONTACT {
  /**
   * For troubleshooting issues
   */
  SUPPORT = "support@plutomi.com",
  /**
   * For general information
   */
  GENERAL = "contact@plutomi.com",
  /**
   * For investor relations
   */
  INVEST = "ir@plutomi.com",
  /**
   * For administrative / Github related
   */
  ADMIN = "jose@plutomi.com",
}

declare module "iron-session" {
  interface IronSessionData {
    user?: {
      orgId: string;
      userId: string;
      userEmail: string;
      // TODO user role RBAC
    };
  }
}

interface StagesDynamoEntry {
  /**
   * Primary key for creating a stage - takes `orgId` and `stageId`
   */
  PK: `ORG#${string}#STAGE#${string}`;
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
  GSI1PK: `ORG#${string}#OPENING#${string}#STAGES`;
  /**
   * The stage name
   */
  GSI1SK: string;
}

type CreateStageInput = Pick<
  StagesDynamoEntry,
  "orgId" | "GSI1SK" | "openingId"
>;

type DeleteStageInput = Pick<StagesDynamoEntry, "orgId" | "stageId">;
type GetStageByIdInput = Pick<StagesDynamoEntry, "orgId" | "stageId">;
type GetStageByIdOutput = StagesDynamoEntry;
type GetAllApplicantsInStageInput = Pick<
  StagesDynamoEntry,
  "orgId" | "stageId"
>;
type GetAllApplicantsInStageOutput = ApplicantDynamoEntry[];

interface UpdateStageInput
  extends Pick<StagesDynamoEntry, "orgId" | "stageId"> {
  newStageValues: { [key: string]: any };
}

interface StageQuestionDynamoEntry {
  /**
   * The primary key for the question. Variables are `orgId` and `questionId`
   */
  PK: `ORG#${string}#STAGE_QUESTION#${string}`;
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
  GSI1PK: `ORG#${string}#STAGE#${string}#QUESTIONS`;

  /**
   * The question title
   */
  GSI1SK: string;
}

type CreateStageQuestionInput = Pick<
  StageQuestionDynamoEntry,
  "orgId" | "stageId" | "GSI1SK" | "questionDescription"
>;

type orgIdAndQuestionId = "orgId" | "questionId";

type DeleteQuestionInput = Pick<StageQuestionDynamoEntry, orgIdAndQuestionId>;

type GetQuestionInput = Pick<StageQuestionDynamoEntry, orgIdAndQuestionId>;
type GetQuestionOutput = StageQuestionDynamoEntry;

type GetAllQuestionsInStageInput = Pick<
  StageQuestionDynamoEntry,
  "orgId" | "stageId"
>;

interface UpdateQuestionInput
  extends Pick<StageQuestionDynamoEntry, orgIdAndQuestionId> {
  newQuestionValues: { [key: string]: any };
}

type GetAllQuestionsInStageOutput = GetQuestionOutput[];

interface ApplicantDynamoEntry {
  /**
   * Primary key of the applicant where the inputs are `orgId` and `applicantId`
   */
  PK: `ORG#${string}#APPLICANT#${string}`;
  /**
   * The {@link ENTITY_TYPES.APPLICANT}
   */
  SK: ENTITY_TYPES.APPLICANT;
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

type CreateApplicantInput = Pick<
  ApplicantDynamoEntry,
  | "orgId"
  | "firstName"
  | "lastName"
  | "applicantEmail"
  | "openingId"
  | "stageId"
>;

type orgIdAndApplicantId = "orgId" | "applicantId";

type CreateApplicantOutput = ApplicantDynamoEntry;
type GetApplicantByIdInput = Pick<ApplicantDynamoEntry, orgIdAndApplicantId>;

type DeleteApplicantInput = Pick<ApplicantDynamoEntry, orgIdAndApplicantId>;

// TODO types for files, etc.
interface GetApplicantByIdOutput extends ApplicantDynamoEntry {
  responses: Object[]; // TODO fix this type with a response type
}

interface UpdateApplicantInput
  extends Pick<ApplicantDynamoEntry, orgIdAndApplicantId> {
  newApplicantValues: { [key: string]: any };
}

interface UpdateApplicantOutput extends ApplicantDynamoEntry {
  responses: Object[]; // TODO fix this type with a response type
}

interface ApplicantResponseEntry {
  /**
   * The primary key for the response - needs an `orgId` and `applicantId`
   */
  PK: `ORG#${string}#APPLICANT#${string}`;
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
  GSI1PK: `ORG#${string}#APPLICANT#${string}`;
  /**
   * Sort key to retrieve all responses for an applicant
   */
  GSI1SK: ENTITY_TYPES.APPLICANT_RESPONSE; // TODO add timestmap?
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
