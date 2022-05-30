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

type CreateQuestionInput = Pick<DynamoQuestion, 'orgId' | 'GSI1SK' | 'description' | 'questionId'>;

type OrgIdAndQuestionId = 'orgId' | 'questionId';

// TODo remove the below types
type DeleteQuestionFromOrgInput = Pick<DynamoQuestion, orgIdAndQuestionId>;
type DeleteWebhookFromOrgInput = Pick<DynamoWebhook, 'webhookId' | 'orgId'>;
type GetQuestionInput = Pick<DynamoQuestion, orgIdAndQuestionId>;
type GetQuestionOutput = DynamoQuestion;

export type GetQuestionsInOrgInput = Pick<DynamoQuestion, 'orgId'>;
export type GetQuestionsInOrgOutput = DynamoQuestion[];

export interface UpdateQuestionInput extends Pick<DynamoQuestion, OrgIdAndQuestionId> {
  newValues: { [key: string]: any };
}

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

type CreateOpeningInput = Pick<DynamoOpening, 'orgId' | 'openingName'>;
type DeleteOpeningInput = Pick<DynamoOpening, 'orgId' | 'openingId'>;

// Retrieves all oepnings by default, can filter on public or private
interface GetOpeningsInOrgInput extends Pick<DynamoOpening, 'orgId'> {
  GSI1SK?: OpeningState;
}

type GetStagesInOpeningInput = Pick<DynamoOpening, 'orgId' | 'openingId' | 'stageOrder'>;
type GetOpeningByIdInput = Pick<DynamoOpening, 'orgId' | 'openingId'>;
export interface UpdateOpeningInput extends Pick<DynamoOpening, 'orgId' | 'openingId'> {
  newValues: { [key: string]: any };
}
export interface UpdateWebhookInput extends Pick<DynamoWebhook, 'orgId' | 'webhookId'> {
  newValues: { [key: string]: any };
}

interface AddQuestionToStageInput
  extends Pick<DynamoStage, 'orgId' | 'openingId' | 'stageId' | 'questionOrder'> {
  questionId: string;
}

interface GetQuestionsInStageInput extends Pick<DynamoStage, 'orgId' | 'openingId' | 'stageId'> {}

type GetWebhooksInOrgInput = Pick<DynamoWebhook, 'orgId'>;
interface DeleteQuestionFromStageInput
  extends Pick<DynamoStage, 'orgId' | 'openingId' | 'stageId' | 'deleteIndex'> {
  questionId: string;
  /**
   * When removing a question from a stage, we want to decrement the stage count on the question.
   * This isn't needed if the question is deleted obviously, and is used in the deletion state machine.
   * which should only be deleting the adjacent item.
   * Set it to FALSE if the question has been deleted form the org.
   */
  decrementStageCount: boolean;
}

interface DeleteOrgInviteInput {
  userId: string;
  inviteId: string;
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
