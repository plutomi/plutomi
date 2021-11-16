import {
  DynamoNewApplicant,
  DynamoNewApplicantResponse,
  DynamoNewStage,
  DynamoNewStageQuestion,
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

declare module "iron-session" {
  export interface IronSessionData {
    user?: {
      orgId: string;
      userId: string;
      email: string;
      // TODO user role RBAC - fix these types
      // TODO fix these types https://github.com/plutomi/plutomi/issues/301
    };
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
