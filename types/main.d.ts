import { IronSessionData } from "iron-session";
import {
  DynamoNewApplicant,
  DynamoNewApplicantResponse,
  DynamoNewLoginLink,
  DynamoNewOpening,
  DynamoNewOrgInvite,
  DynamoNewStage,
  DynamoNewStageQuestion,
  DynamoNewUser,
} from "./dynamo";

type CreateApplicantAPIBody = CreateApplicantInput;
export interface CreateApplicantAPIResponse {
  message: string;
}

/**
 * All possible parameters in the URL
 */

export interface CUSTOM_QUERY {
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
   * The seal to for the {@link ENTITY_TYPES.LOGIN_LINK} that contains the user id
   */
  seal: string;
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

interface UserSessionData
  extends Pick<
    DynamoNewUser,
    "firstName" | "lastName" | "GSI1SK" | "email" | "orgId" | "userId"
  > {
  totalInvites: number;
}
declare module "iron-session" {
  export interface IronSessionData {
    user: UserSessionData;
  }
}

type CreateStageInput = Pick<DynamoNewStage, "orgId" | "GSI1SK" | "openingId">;
type DeleteStageInput = Pick<DynamoNewStage, "orgId" | "stageId">;
type GetStageByIdInput = Pick<DynamoNewStage, "orgId" | "stageId">;
type GetStageByIdOutput = DynamoNewStage;
type GetAllApplicantsInStageInput = Pick<DynamoNewStage, "orgId" | "stageId">;
type GetAllApplicantsInStageOutput = DynamoNewApplicant[];

export interface UpdateStageInput
  extends Pick<DynamoNewStage, "orgId" | "stageId"> {
  newStageValues: { [key: string]: any };
}

export interface UpdateUserInput extends Pick<DynamoNewUser, "userId"> {
  newUserValues: { [key: string]: any };
  ALLOW_FORBIDDEN_KEYS?: boolean;
}

type CreateStageQuestionInput = Pick<
  DynamoNewStageQuestion,
  "orgId" | "stageId" | "GSI1SK" | "questionDescription"
>;

type orgIdAndQuestionId = "orgId" | "questionId";

type DeleteQuestionInput = Pick<DynamoNewStageQuestion, orgIdAndQuestionId>;

type GetQuestionInput = Pick<DynamoNewStageQuestion, orgIdAndQuestionId>;
type GetQuestionOutput = DynamoNewStageQuestion;

type GetAllQuestionsInStageInput = Pick<
  DynamoNewStageQuestion,
  "orgId" | "stageId"
>;

export interface UpdateQuestionInput
  extends Pick<DynamoNewStageQuestion, orgIdAndQuestionId> {
  newQuestionValues: { [key: string]: any };
}

type GetAllQuestionsInStageOutput = GetQuestionOutput[];

type CreateApplicantInput = Pick<
  DynamoNewApplicant,
  "orgId" | "firstName" | "lastName" | "email" | "openingId" | "stageId"
>;

type orgIdAndApplicantId = "orgId" | "applicantId";

type CreateApplicantOutput = DynamoNewApplicant;
type GetApplicantByIdInput = Pick<DynamoNewApplicant, orgIdAndApplicantId>;

type DeleteApplicantInput = Pick<DynamoNewApplicant, orgIdAndApplicantId>;

// TODO types for files, etc.
export interface GetApplicantByIdOutput extends DynamoNewApplicant {
  responses: Object[]; // TODO fix this type with a response type
}

export interface UpdateApplicantInput
  extends Pick<DynamoNewApplicant, orgIdAndApplicantId> {
  newApplicantValues: { [key: string]: any };
}

export interface UpdateApplicantOutput extends DynamoNewApplicant {
  responses: Object[]; // TODO fix this type with a response type
}

type CreateApplicantResponseInput = Pick<
  DynamoNewApplicantResponse,
  | "orgId"
  | "applicantId"
  | "questionTitle"
  | "questionDescription"
  | "questionResponse"
>;

type CreateApplicantResponseOutput = DynamoNewApplicantResponse;

type CreateOpeningInput = Pick<DynamoNewOpening, "orgId" | "GSI1SK">;
type DeleteOpeningInput = Pick<DynamoNewOpening, "orgId" | "openingId">;
type GetAllApplicantsInOpeningInput = Pick<
  DynamoNewOpening,
  "orgId" | "openingId"
>;

type GetAllOpeningsInOrgInput = Pick<DynamoNewOpening, "orgId">;
type GetAllStagesInOpeningInput = Pick<DynamoNewOpening, "orgId" | "openingId">;
type GetOpeningByIdInput = Pick<DynamoNewOpening, "orgId" | "openingId">;
export interface UpdateOpeningInput
  extends Pick<DynamoNewOpening, "orgId" | "openingId"> {
  newOpeningValues: { [key: string]: any };
}

interface DeleteOrgInviteInput {
  userId: string;
  inviteId: string;
}

interface CreateOrgInviteInput {
  orgId: string;
  orgName: string;
  expiresAt: string;
  createdBy: UserSessionData;
  recipient: DynamoNewUser;
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
  userId: string;
  loginLinkId: string;
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
  GSI1SK: string; /// The org name
};

type GetAllUsersInOrgInput = {
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
  userId: string;
  orgId?: string | boolean; // If the user has an orgId, a LOGIN_EVENT will be created on the org as well
};
