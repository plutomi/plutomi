// This file is for the actual DynamoDB entries and their Types - ie: A full object with all properties.
// All  other types are derivatives with Pick, Omit, etc.
import { DEFAULTS, ENTITY_TYPES } from "../Config";
import { UserSessionData } from "./main";
interface DynamoNewStage {
  /**
   * Primary key for creating a stage - takes `orgId`, `openingId`, & `stageId`
   */
  PK: `${ENTITY_TYPES.ORG}#${string}#${ENTITY_TYPES.OPENING}#${string}${ENTITY_TYPES.STAGE}#${string}`;
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
   * The order of the questions for the stage // TODO remove with new format
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
   * The index key to get all stages in an opening. Requires `orgId` and `openingId`
   */
  GSI1PK: `${ENTITY_TYPES.ORG}#${string}#${ENTITY_TYPES.OPENING}#${string}#${ENTITY_TYPES.STAGE}S`;
  /**
   * The stage name
   */
  GSI1SK: string;

  /**
   * Linked list to get next & previous stages
   * If `nextStage` not provided, stage is added to the end of the opening.
   * `previousStage` becomes the last stage
   */
  nextStage?: string | null;
  previousStage?: string | null;
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
  PK: `${ENTITY_TYPES.APPLICANT}#${string}`;
  /**
   * The {@link ENTITY_TYPES.APPLICANT}
   */
  SK: ENTITY_TYPES.APPLICANT;
  /**
   * First name of the applicant
   * @default - {@link DEFAULTS.FIRST_NAME}
   */
  firstName: string;
  /**
   * Last name of the applicant
   * @default - {@link DEFAULTS.LAST_NAME}
   *
   * */
  lastName: string;
  /**
   * Full name of the applicant. Concatenated `firstName` and `lastName`
   * @default - {@link DEFAULTS.FULL_NAME}
   */
  fullName: `${string} ${string}`;

  /**
   * If an applicant has unsubscribed from emails
   */
  canReceiveEmails: boolean;
  /**
   * If the applicant's email has been verified (clicked on the application link sent to their email // TODO maybe answered questions on one stage?)
   */
  isEmailVerified: boolean;
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
  /**
   * The key to unsubscribe this applicant from emails -
   * TODO when adding login portal (one applicant, many applications across orgs)
   * this can be set at the applicant level
   */
  unsubscribeKey: string;
  /**
   * The current opening and stage the applicant is in
   */
  GSI1PK: `${ENTITY_TYPES.ORG}#${string}#${ENTITY_TYPES.OPENING}#${string}#${ENTITY_TYPES.STAGE}#${string}`;
  /**
   * The date the applicant landed on this stage - ISO timestamp
   */
  GSI1SK: `DATE_LANDED#${string}`;
}

interface DynamoNewApplicantResponse {
  /**
   * The primary key for the response - needs an `orgId` and `applicantId`
   */
  PK: `${ENTITY_TYPES.APPLICANT}#${string}`;
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

interface DynamoNewOpening {
  /**
   * Primary key for creating an opening. Takes an `orgId`
   */
  PK: `${ENTITY_TYPES.ORG}#${string}#${ENTITY_TYPES.OPENING}#${string}`;
  /**
   * {@link ENTITY_TYPES.OPENING}
   */
  SK: ENTITY_TYPES.OPENING;

  /**
   * The org this opening belongs to
   */

  orgId: string;
  /**
   * {@link ENTITY_TYPES.OPENING}
   */
  entityType: ENTITY_TYPES.OPENING;
  /**
   * ISO Timestamp of when the opening was created
   */
  createdAt: string;
  /**
   * The ID of the opening
   */
  openingId: string;
  /**
   * GSIPK to retrieve all openings in an org. Takes an `orgId`
   */
  GSI1PK: `${ENTITY_TYPES.ORG}#${string}#${ENTITY_TYPES.OPENING}S`;
  /**
   * The opening name
   */
  GSI1SK: string;
  /**
   * Total stages in opening.
   * @default 0
   */
  totalStages: number;
  /**
   *
   *  Total applicants in opening.
   * @default 0
   */

  totalApplicants: number;
  /**
   * If the opening should be public
   */
  isPublic: boolean;
  /**
   * An array of `stageId`s, and the order they should be shown in
   */
  stageOrder: string[];
}

interface DynamoNewOrgInvite {
  /**
   * Primary key, requires a `userId`
   */
  PK: `${ENTITY_TYPES.USER}#${string}`;
  /**
   * Sort key, takes in an `inviteId`
   */
  SK: `${ENTITY_TYPES.ORG_INVITE}#${string}`;
  /**
   * The orgId this invite is for
   */
  orgId: string;
  /**
   * The actual name of the org to show on the invite
   */
  orgName: string;
  /**
   * Who created this invite, info comes from their session
   */
  createdBy: Pick<DynamoNewUser, "firstName" | "lastName" | "orgId">;

  recipient: DynamoNewUser;
  /**
   * The entity type, see {@link ENTITY_TYPES.ORG_INVITE}
   */
  entityType: ENTITY_TYPES.ORG_INVITE;
  /**
   * ISO string timestamp of when this invite was created
   */
  createdAt: string;
  /**
   * ISO string timestamp of when this invite becomes invalid
   */
  expiresAt: string;
  /**
   * The invite's id
   */
  inviteId: string;
  /**
   * PK for the GSI, takes an 'orgId' to be able to retrieve all invites for an org
   */
  GSI1PK: `${ENTITY_TYPES.ORG}#${string}#${ENTITY_TYPES.ORG_INVITE}S`;
  /**
   * Current ISO timestamp, same as when createdAt
   */
  GSI1SK: string;
}

interface DynamoNewUser {
  PK: `${ENTITY_TYPES.USER}#${string}`;
  SK: ENTITY_TYPES.USER;
  /**
   * The given `firstName`
   * @default DEFAULTS.FIRST_NAME
   */
  firstName: string | DEFAULTS.FIRST_NAME;
  /**
   * The given `lastName`
   * @default DEFAULTS.LAST_NAME
   */
  lastName: string | DEFAULTS.LAST_NAME;
  email: string;
  userId: string;
  entityType: ENTITY_TYPES.USER;
  createdAt: string;
  orgId: DEFAULTS.NO_ORG;
  orgJoinDate: DEFAULTS.NO_ORG;
  GSI1PK: `${ENTITY_TYPES.ORG}#${DEFAULTS.NO_ORG}#${ENTITY_TYPES.USER}S`;
  /**
   * Combined `firstName` and `lastName`
   * @default DEFAULTS.FULL_NAME
   */
  GSI1SK: `${string} ${string}` | DEFAULTS.FULL_NAME;
  GSI2PK: string;
  GSI2SK: ENTITY_TYPES.USER;
  unsubscribeKey: string;
  canReceiveEmails: boolean;
  verifiedEmail: boolean;
  totalInvites: number;
}

interface DynamoNewLoginLink {
  PK: `${ENTITY_TYPES.USER}#${string}`;
  SK: `${ENTITY_TYPES.LOGIN_LINK}#${string}`;
  entityType: ENTITY_TYPES.LOGIN_LINK;
  createdAt: string;
  relativeExpiry: string;
  user: DynamoNewUser;
  loginLinkUrl: string;
  /**
   * A UNIX date for which Dynamo will auto delete this link
   */
  ttlExpiry: number; // Unix timestmap for the item to be deleted after 15 minutes, must be >= ttl on `sealData`
  GSI1PK: `${ENTITY_TYPES.USER}#${string}#${ENTITY_TYPES.LOGIN_LINK}S`; // Get latest login link(s) for a user for throttling
  GSI1SK: string; // ISO timestamp
}

interface DynamoNewOrg {
  PK: `${ENTITY_TYPES.ORG}#${string}`;
  SK: ENTITY_TYPES.ORG;
  orgId: string; // The actual org id
  entityType: ENTITY_TYPES.ORG;
  createdAt: string; // ISO timestamp
  totalApplicants: number;
  totalOpenings: number; // TODO set defaults..??? I mean its all 0.. And if we reference this interface
  // Somewhere else, the numbers might change so its not wise to have it set as default.. althought we can always
  // <Omit> in and make the counts numbers.. hmmmm // TODO revisit
  totalStages: number;
  totalUsers: number;
  displayName: string;
}

interface DynamoNewLoginEvent {
  PK: `${ENTITY_TYPES.USER}#${string}`; // TODO set login events as org events if the user has an org
  SK: `${ENTITY_TYPES.LOGIN_EVENT}#${string}`;
  createdAt: string; // ISO timestamp
  ttlExpiry: number; // ttl unix expiry
  entityType: ENTITY_TYPES.LOGIN_EVENT;
  user: DynamoNewUser;
}
