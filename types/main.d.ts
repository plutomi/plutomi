import { HttpMethod, HttpApi } from "@aws-cdk/aws-apigatewayv2";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { Table } from "@aws-cdk/aws-dynamodb";
import { StackProps } from "@aws-cdk/core";
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

type DynamoActions =
  | "dynamodb:GetItem"
  | "dynamodb:BatchGetItem"
  | "dynamodb:Query"
  | "dynamodb:PutItem"
  | "dynamodb:UpdateItem"
  | "dynamodb:DeleteItem"
  | "dynamodb:BatchWriteItem";
export interface CDKLambda {
  /**
   * Name of the lambda function
   */
  name: string;
  /**
   * Environment variables for the lambda function
   */
  environment: {
    DYNAMO_TABLE_NAME?: string;
    LOGIN_LINKS_PASSWORD?: string;
    SESSION_PASSWORD?: string;
  };
  filePath: string;
  /**
   * Path for the API, such as "/users/{userId}"
   */
  APIPath: string;
  /**
   * HTTP Method for the API call
   */
  method: HttpMethod;
  /**
   * What actions the lambda is allowed to perform such as
   * "dynamodb:Query", "dynamodb:PutItem", "dynamodb:GetItem"
   */
  dynamoActions: DynamoActions[];
  /**
   * What the lambda is allowed to access from the DynamoDB table
   */
  dynamoResources: {
    main?: boolean;
    GSI1?: boolean;
    GSI2?: boolean;
  };
}

export interface LambdaAPIProps extends StackProps {
  table: Table;
  api: HttpApi;
}

type CreateApplicantAPIBody = Omit<CreateApplicantInput, "stageId">;
export interface CreateApplicantAPIResponse {
  message: string;
}

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
   * The seal to for the {@link ENTITY_TYPES.LOGIN_LINK} that contains the user id
   */
  seal: string;

  callbackUrl: string;
  questionId: string;
  inviteId: string;
}

interface UserSessionData
  extends Pick<
    DynamoNewUser,
    "firstName" | "lastName" | "email" | "orgId" | "userId"
  > {}

export interface CreateStageInput
  extends Pick<DynamoNewStage, "orgId" | "GSI1SK" | "openingId"> {
  stageOrder: string[];
}
export interface DeleteStageInput
  extends Pick<DynamoNewStage, "orgId" | "stageId"> {
  openingId: string;
  stageOrder: string[];
}
type GetStageByIdInput = Pick<DynamoNewStage, "orgId" | "stageId">;
type GetStageByIdOutput = DynamoNewStage;
type GetAllApplicantsInStageInput = Pick<
  DynamoNewStage,
  "orgId" | "stageId" | "openingId"
>;
type GetAllApplicantsInStageOutput = DynamoNewApplicant[];

export interface UpdateStageInput
  extends Pick<DynamoNewStage, "orgId" | "stageId"> {
  newValues: { [key: string]: any };
}

export type SessionData = Pick<
  DynamoNewUser,
  "firstName" | "lastName" | "orgId" | "email" | "userId" | "canReceiveEmails"
>;
export type withSessionEvent = APIGatewayProxyEventV2 & {
  requestContext: {
    authorizer: {
      lambda: {
        session: UserSessionData;
      };
    };
  };
};

export interface UpdateUserInput extends Pick<DynamoNewUser, "userId"> {
  newValues: { [key: string]: any };
  /**
   * Allows updating some properties that are typically banned, such as an orgId or an email.
   * This shoudnt be set if its with newValues, only when directly updating an attribute verified on our end.
   * TODO Only allow certain variables to  be updated via array of strings or whatever
   */
  ALLOW_FORBIDDEN_KEYS?: boolean;
}

export interface CreateStageQuestionInput
  extends Pick<
    DynamoNewStageQuestion,
    "orgId" | "stageId" | "GSI1SK" | "questionDescription"
  > {
  questionOrder: string[];
}

type orgIdAndQuestionId = "orgId" | "questionId";

export interface DeleteQuestionInput
  extends Pick<DynamoNewStageQuestion, orgIdAndQuestionId> {
  stageId: string;
  questionOrder: string[];
  deletedQuestionIndex: number;
}

type GetQuestionInput = Pick<DynamoNewStageQuestion, orgIdAndQuestionId>;
type GetQuestionOutput = DynamoNewStageQuestion;

export interface GetAllQuestionsInStageInput
  extends Pick<DynamoNewStageQuestion, "orgId" | "stageId"> {
  questionOrder: string[];
}

export interface UpdateQuestionInput
  extends Pick<DynamoNewStageQuestion, orgIdAndQuestionId> {
  newValues: { [key: string]: any };
}

type GetAllQuestionsInStageOutput = GetQuestionOutput[];

type CreateApplicantInput = Pick<
  DynamoNewApplicant,
  "orgId" | "firstName" | "lastName" | "email" | "openingId" | "stageId"
>;

type orgIdAndApplicantId = "orgId" | "applicantId";

type CreateApplicantOutput = DynamoNewApplicant;
type GetApplicantByIdInput = Pick<DynamoNewApplicant, "applicantId">;

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
  | "orgId"
  | "applicantId"
  | "questionTitle"
  | "questionDescription"
  | "questionResponse"
>;

type CreateApplicantResponseOutput = DynamoNewApplicantResponse;

type CreateOpeningInput = Pick<DynamoNewOpening, "orgId" | "GSI1SK">;
type DeleteOpeningInput = Pick<DynamoNewOpening, "orgId" | "openingId">;

type GetAllOpeningsInOrgInput = Pick<DynamoNewOpening, "orgId">;
type GetAllStagesInOpeningInput = Pick<
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
  loginLinkId: string;
  loginMethod: string; // GOOGLE or LINK
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
  user: DynamoNewUser;
};
