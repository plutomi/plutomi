import { OPENING_STATE } from "../Config";
import {
  DynamoApplicant,
  DynamoApplicantResponse,
  DynamoOpening,
  DynamoOrgInvite,
  DynamoStage,
  DynamoQuestion,
  DynamoUser,
  DynamoWebhook,
} from "./dynamo";
type DynamoActions =
  | "dynamodb:GetItem"
  | "dynamodb:BatchGetItem"
  | "dynamodb:Query"
  | "dynamodb:PutItem"
  | "dynamodb:UpdateItem"
  | "dynamodb:DeleteItem"
  | "dynamodb:BatchWriteItem";

type CreateApplicantAPIBody = Omit<CreateApplicantInput, "stageId">;

/**
 * All possible parameters in the URL
 */
interface CUSTOM_QUERY {
  orgId: string;
  openingId: string;
  userId: string;
  stageId: string;

  applicantId: string;
  /**
   * The token to for the {@link ENTITY_TYPES.LOGIN_LINK} that contains the user id
   */
  token: string;
  callbackUrl: string;
  questionId: string;
  inviteId: string;
}
export interface CreateStageInput
  extends Pick<DynamoStage, "orgId" | "GSI1SK" | "openingId"> {
  /**
   * Optional position on where to place the new opening, optional. Added to the end if not provided
   */
  position?: number;
  // To figure out where to place it
  stageOrder: string[];
}
interface DeleteStageInput
  extends Pick<DynamoStage, "orgId" | "stageId" | "openingId"> {
  deleteIndex: number;
}
type GetStageByIdInput = Pick<DynamoStage, "orgId" | "stageId" | "openingId">;
type GetStageByIdOutput = DynamoStage;
type GetApplicantsInStageInput = Pick<
  DynamoStage,
  "orgId" | "stageId" | "openingId"
>;
type GetApplicantsInStageOutput = DynamoApplicant[];

export interface UpdateStageInput
  extends Pick<DynamoStage, "orgId" | "stageId" | "openingId"> {
  newValues: { [key: string]: any };
}

export type SessionData = Pick<
  DynamoUser,
  "firstName" | "lastName" | "orgId" | "email" | "userId" | "canReceiveEmails"
>;

export interface UpdateUserInput extends Pick<DynamoUser, "userId"> {
  newValues: { [key: string]: any };
}

type CreateQuestionInput = Pick<
  DynamoQuestion,
  "orgId" | "GSI1SK" | "description" | "questionId"
>;

type orgIdAndQuestionId = "orgId" | "questionId";

// TODo remove the below types
type DeleteQuestionFromOrgInput = Pick<DynamoQuestion, orgIdAndQuestionId>;

type GetQuestionInput = Pick<DynamoQuestion, orgIdAndQuestionId>;
type GetQuestionOutput = DynamoQuestion;

export type GetQuestionsInOrgInput = Pick<DynamoQuestion, "orgId">;
export type GetQuestionsInOrgOutput = DynamoQuestion[];

export interface UpdateQuestionInput
  extends Pick<DynamoQuestion, orgIdAndQuestionId> {
  newValues: { [key: string]: any };
}

type GetQuestionsInStageOutput = GetQuestionOutput[];

type CreateWebhookInput = Pick<DynamoWebhook, "url" | "orgId">;
type CreateApplicantInput = Pick<
  DynamoApplicant,
  "orgId" | "firstName" | "lastName" | "email" | "openingId" | "stageId"
>;

type orgIdAndApplicantId = "orgId" | "applicantId";

export type NavbarItem = {
  /**
   * The name of the navbar item such as 'Dashboard' or 'Questions'
   */
  name: string;
  /**
   * The path of the page such as '/dashboard' or '/questions'
   */
  href: string;
  /**
   * If this item should be hidden when a user is not in an org.
   */
  hiddenIfNoOrg: boolean;
  /**
   * If this item should be hidden if a user is in an org.  Usually false, but
   * used for things like Invites in which a user shouldn't be accepting invites
   * while tey are already in an org
   */
  hiddenIfOrg: boolean;
};

type CreateApplicantOutput = DynamoApplicant;
type GetApplicantByIdInput = Pick<DynamoApplicant, "orgId" | "applicantId">;

type DeleteApplicantInput = Pick<
  DynamoApplicant,
  orgIdAndApplicantId | "openingId" | "stageId" // Last two are needed to decrement the applicant count
>;

// TODO types for files, etc.
export interface GetApplicantByIdOutput extends DynamoApplicant {
  responses: Object[]; // TODO fix this type with a response type
}

export interface UpdateApplicantInput
  extends Pick<DynamoApplicant, orgIdAndApplicantId> {
  newValues: { [key: string]: any };
}

export interface UpdateApplicantOutput extends DynamoApplicant {
  responses: Object[]; // TODO fix this type with a response type
}

type CreateApplicantResponseInput = Pick<
  DynamoApplicantResponse,
  "orgId" | "applicantId" | "questionTitle" | "description" | "questionResponse"
>;

type CreateApplicantResponseOutput = DynamoApplicantResponse;

type CreateOpeningInput = Pick<DynamoOpening, "orgId" | "openingName">;
type DeleteOpeningInput = Pick<DynamoOpening, "orgId" | "openingId">;

// Retrieves all oepnings by default, can filter on public or private
interface GetOpeningsInOrgInput extends Pick<DynamoOpening, "orgId"> {
  GSI1SK?: OPENING_STATE;
}

type GetStagesInOpeningInput = Pick<
  DynamoOpening,
  "orgId" | "openingId" | "stageOrder"
>;
type GetOpeningByIdInput = Pick<DynamoOpening, "orgId" | "openingId">;
export interface UpdateOpeningInput
  extends Pick<DynamoOpening, "orgId" | "openingId"> {
  newValues: { [key: string]: any };
}

interface AddQuestionToStageInput
  extends Pick<
    DynamoStage,
    "orgId" | "openingId" | "stageId" | "questionOrder"
  > {
  questionId: string;
}

type GetWebhooksInOrgInput = Pick<DynamoWebhook, "orgId">;
interface DeleteQuestionFromStageInput
  extends Pick<DynamoStage, "orgId" | "openingId" | "stageId" | "deleteIndex"> {
  questionId: string;
  /**
   * Whether to decrement the stage count on the question.
   * Set it to FALSE if the question has been deleted form the org.
   */
  decrementStageCount: boolean;
}
interface DeleteOrgInviteInput {
  userId: string;
  inviteId: string;
}

interface CreateOrgInviteInput {
  orgName: string;
  expiresAt: string;
  createdBy: Pick<DynamoUser, "firstName" | "lastName" | "orgId">;
  recipient: Pick<
    DynamoUser,
    "userId" | "email" | "unsubscribeKey" | "firstName" | "lastName"
  >;
}

type CreateUserInput = {
  email: string;
  firstName?: string;
  lastName?: string;
};

type GetOrgInvitesForUserInput = {
  userId: string;
};

type GetOrgInviteInput = {
  userId: string;
  inviteId: string;
};

type JoinOrgFromInviteInput = {
  userId: string;
  invite: DynamoOrgInvite; // TODO I think the invite sent to the client is the clean version, need to verify this and if so make types for the clean version anyway
};

type CreateLoginLinkInput = {
  loginLinkId: string;
  loginLinkUrl: string;
  loginLinkExpiry: string;
  user: DynamoUser;
};

type DeleteLoginLinkInput = {
  userId: string;
  loginLinkTimestmap: string;
};

type GetLatestLoginLinkInput = {
  userId: string;
};

type CreateAndJoinOrgInput = {
  userId: string;
  orgId: string;
  displayName: string;
};

type LeaveAndDeleteOrgInput = {
  orgId: string;
  userId: string;
};

type GetUsersInOrgInput = {
  orgId: string;
  /**
   * Optional limit to only return a certain number of users
   */
  limit?: number;
};

type GetOrgInput = {
  orgId: string;
};

type GetUserByIdInput = {
  userId: string;
};

interface GetUserByEmailInput {
  email: string;
}

type CreateLoginEventAndDeleteLoginLinkInput = {
  loginLinkId: string;
  user: DynamoUser;
};
