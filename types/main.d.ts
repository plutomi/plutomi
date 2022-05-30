import { OpeningState } from '../Config';

import {
  DynamoApplicant,
  DynamoApplicantResponse,
  DynamoOpening,
  DynamoOrgInvite,
  DynamoStage,
  DynamoQuestion,
  DynamoUser,
  DynamoWebhook,
} from './dynamo';

type DynamoActions =
  | 'dynamodb:GetItem'
  | 'dynamodb:BatchGetItem'
  | 'dynamodb:Query'
  | 'dynamodb:PutItem'
  | 'dynamodb:UpdateItem'
  | 'dynamodb:DeleteItem'
  | 'dynamodb:BatchWriteItem';

type CreateApplicantAPIBody = Omit<CreateApplicantInput, 'stageId'>;

/**
 * All possible parameters in the URL
 */
interface CustomQuery {
  orgId: string;
  openingId: string;
  userId: string;
  stageId: string;

  applicantId: string;
  /**
   * The token to for the {@link Entities.LOGIN_LINK} that contains the user id
   */
  token: string;
  callbackUrl: string;
  questionId: string;
  inviteId: string;
}
export interface CreateStageInput extends Pick<DynamoStage, 'orgId' | 'GSI1SK' | 'openingId'> {
  /**
   * Optional position on where to place the new opening, optional. Added to the end if not provided
   */
  position?: number;
  // To figure out where to place it
  stageOrder: string[];
}
interface DeleteStageInput extends Pick<DynamoStage, 'orgId' | 'stageId' | 'openingId'> {
  deleteIndex: number;
}
type GetStageByIdInput = Pick<DynamoStage, 'orgId' | 'stageId' | 'openingId'>;

export interface UpdateStageInput extends Pick<DynamoStage, 'orgId' | 'stageId' | 'openingId'> {
  newValues: { [key: string]: any };
}

export interface SettingsCrumbsProps {
  name: string;
  href: string;
  current: boolean;
}

export type SessionData = Pick<
  DynamoUser,
  'firstName' | 'lastName' | 'orgId' | 'email' | 'userId' | 'canReceiveEmails'
>;

export interface UpdateUserInput extends Pick<DynamoUser, 'userId'> {
  newValues: { [key: string]: any };
}

type OrgIdAndQuestionId = 'orgId' | 'questionId';

type DeleteWebhookFromOrgInput = Pick<DynamoWebhook, 'webhookId' | 'orgId'>;

type GetQuestionsInStageOutput = GetQuestionOutput[];

type GetWebhookByIdInput = Pick<DynamoWebhook, 'orgId' | 'webhookId'>;

type CreateWebhookInput = Pick<
  DynamoWebhook,
  'webhookUrl' | 'orgId' | 'description' | 'webhookName'
>;

type OrgIdAndApplicantId = 'orgId' | 'applicantId';

// TODO types for files, etc.
export interface GetApplicantByIdOutput extends DynamoApplicant {
  responses: Object[]; // TODO fix this type with a response type
}

export interface UpdateApplicantOutput extends DynamoApplicant {
  responses: Object[]; // TODO fix this type with a response type
}

type GetStagesInOpeningInput = Pick<DynamoOpening, 'orgId' | 'openingId' | 'stageOrder'>;

export interface UpdateWebhookInput extends Pick<DynamoWebhook, 'orgId' | 'webhookId'> {
  newValues: { [key: string]: any };
}

type GetWebhooksInOrgInput = Pick<DynamoWebhook, 'orgId'>;

type CreateUserInput = {
  email: string;
  firstName?: string;
  lastName?: string;
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

type GetUsersInOrgInput = {
  orgId: string;
  /**
   * Optional limit to only return a certain number of users
   */
  limit?: number;
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
