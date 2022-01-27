import { OPENING_PUBLIC_STATE } from "../Config";
import {
  DynamoNewApplicant,
  DynamoNewApplicantResponse,
  DynamoNewOpening,
  DynamoNewOrgInvite,
  DynamoNewStage,
  DynamoNewQuestion,
  DynamoNewUser,
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
  extends Pick<DynamoNewStage, "orgId" | "GSI1SK" | "openingId"> {
  /**
   * Optional position on where to place the new opening, optional. Added to the end if not provided
   */
  position?: number;
  // To figure out where to place it
  stageOrder: string[];
}
interface DeleteStageInput
  extends Pick<DynamoNewStage, "orgId" | "stageId" | "openingId"> {
  stageOrder: string[]; // To delete it from the opening
}
type GetStageByIdInput = Pick<
  DynamoNewStage,
  "orgId" | "stageId" | "openingId"
>;
type GetStageByIdOutput = DynamoNewStage;
type GetApplicantsInStageInput = Pick<
  DynamoNewStage,
  "orgId" | "stageId" | "openingId"
>;
type GetApplicantsInStageOutput = DynamoNewApplicant[];

export interface UpdateStageInput
  extends Pick<DynamoNewStage, "orgId" | "stageId" | "openingId"> {
  newValues: { [key: string]: any };
}

export type SessionData = Pick<
  DynamoNewUser,
  "firstName" | "lastName" | "orgId" | "email" | "userId" | "canReceiveEmails"
>;

export interface UpdateUserInput extends Pick<DynamoNewUser, "userId"> {
  newValues: { [key: string]: any };
}

type CreateQuestionInput = Pick<
  DynamoNewQuestion,
  "orgId" | "GSI1SK" | "description" | "questionId"
>;

type orgIdAndQuestionId = "orgId" | "questionId";

// TODo remove the below types
type DeleteQuestionInput = Pick<DynamoNewQuestion, orgIdAndQuestionId>;

type GetQuestionInput = Pick<DynamoNewQuestion, orgIdAndQuestionId>;
type GetQuestionOutput = DynamoNewQuestion;

export type GetQuestionsInOrgInput = Pick<DynamoNewQuestion, "orgId">;
export type GetQuestionsInOrgOutput = DynamoNewQuestion[];

export interface UpdateQuestionInput
  extends Pick<DynamoNewQuestion, orgIdAndQuestionId> {
  newValues: { [key: string]: any };
}

type GetQuestionsInStageOutput = GetQuestionOutput[];

type CreateApplicantInput = Pick<
  DynamoNewApplicant,
  "orgId" | "firstName" | "lastName" | "email" | "openingId" | "stageId"
>;

type orgIdAndApplicantId = "orgId" | "applicantId";

type CreateApplicantOutput = DynamoNewApplicant;
type GetApplicantByIdInput = Pick<DynamoNewApplicant, "orgId" | "applicantId">;

type DeleteApplicantInput = Pick<
  DynamoNewApplicant,
  orgIdAndApplicantId | "openingId" | "stageId" // Last two are needed to decrement the applicant count
>;

// TODO types for files, etc.
export interface GetApplicantByIdOutput extends DynamoNewApplicant {
  responses: Object[]; // TODO fix this type with a response type
}

export interface UpdateApplicantInput
  extends Pick<DynamoNewApplicant, orgIdAndApplicantId> {
  newValues: { [key: string]: any };
}

export interface UpdateApplicantOutput extends DynamoNewApplicant {
  responses: Object[]; // TODO fix this type with a response type
}

type CreateApplicantResponseInput = Pick<
  DynamoNewApplicantResponse,
  "orgId" | "applicantId" | "questionTitle" | "description" | "questionResponse"
>;

type CreateApplicantResponseOutput = DynamoNewApplicantResponse;

type CreateOpeningInput = Pick<DynamoNewOpening, "orgId" | "openingName">;
type DeleteOpeningInput = Pick<DynamoNewOpening, "orgId" | "openingId">;

// Retrieves all oepnings by default, can filter on public or private
interface GetOpeningsInOrgInput extends Pick<DynamoNewOpening, "orgId"> {
  GSI1SK?: OPENING_PUBLIC_STATE;
}

type GetStagesInOpeningInput = Pick<
  DynamoNewOpening,
  "orgId" | "openingId" | "stageOrder"
>;
type GetOpeningByIdInput = Pick<DynamoNewOpening, "orgId" | "openingId">;
export interface UpdateOpeningInput
  extends Pick<DynamoNewOpening, "orgId" | "openingId"> {
  newValues: { [key: string]: any };
}

interface DeleteOrgInviteInput {
  userId: string;
  inviteId: string;
}

interface CreateOrgInviteInput {
  orgName: string;
  expiresAt: string;
  createdBy: Pick<DynamoNewUser, "firstName" | "lastName" | "orgId">;
  recipient: Pick<
    DynamoNewUser,
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
  invite: DynamoNewOrgInvite; // TODO I think the invite sent to the client is the clean version, need to verify this and if so make types for the clean version anyway
};

type CreateLoginLinkInput = {
  loginLinkId: string;
  loginLinkUrl: string;
  loginLinkExpiry: string;
  user: DynamoNewUser;
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
  user: DynamoNewUser;
};
