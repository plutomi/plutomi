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

export interface SettingsCrumbsProps {
  name: string;
  href: string;
  current: boolean;
}

export type SessionData = Pick<
  DynamoUser,
  'firstName' | 'lastName' | 'orgId' | 'email' | 'userId' | 'canReceiveEmails'
>;

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

export interface UpdateWebhookInput extends Pick<DynamoWebhook, 'orgId' | 'webhookId'> {
  newValues: { [key: string]: any };
}

type GetWebhooksInOrgInput = Pick<DynamoWebhook, 'orgId'>;

type DeleteLoginLinkInput = {
  userId: string;
  loginLinkTimestmap: string;
};
