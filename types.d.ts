import { APIGatewayProxyEventV2 } from "aws-lambda";

interface GetOrgInput {
  orgId: string;
}

interface CreateUserInput {
  firstName?: string;
  lastName?: string;
  userEmail: string;
}

interface GetOpeningInput {
  orgId: string;
  openingId: string;
}
interface GetApplicantInput {
  orgId: string;
  applicantId: string;
}
interface DynamoCreateStageInput {
  orgId: string;
  openingId: string;
  GSI1SK: string;
}

interface GetStageInput {
  orgId: string;
  stageId: string;
}

interface CreateStageQuestionInput {
  orgId: string;
  stageId: string;
  GSI1SK: string;
  question_description: string;
}

interface CreateStageRuleInput {
  orgId: string;
  openingId: string;
  stageId: string;
  validation: string; // TODO
}

interface CreateApplicantInput {
  orgId: string;
  firstName: string;
  lastName: string;
  email: string;
  openingId: string;
  stageId: string;
}

interface CreateApplicantResponseInput {
  orgId: string;
  applicantId: string;
  question_title: string;
  question_description: string;
  question_response: string;
}

interface GetOrgInviteInput {
  userId: string;
  timestamp: string;
  invite_id: string;
}

interface AcceptOrgInviteInput {
  userId: string;
  timestamp: string;
  invite_id: string;
}

type StageTypes = "idle" | "active" | "frozen" | "deletion";

interface APICreateRuleInput {
  validation: string; // I believe this will be a template string combination.
}

interface APICreateOrgInput {
  GSI1SK: string;
  orgId: string;
}

interface APICreateOrgInviteInput {
  recipientEmail: string;
  expiry_time_days?: number;
}

interface APIAcceptOrgInvite {
  timestamp: string;
  invite_id: string;
}

interface APIRejectOrgInvite {
  timestamp: string;
  invite_id: string;
}

interface DeleteStageInput {
  orgId: string;
  stageId: string;
}

interface APIReorderStagesInput {
  new_stage_order: string[];
}

interface ReorderStagesInput {
  orgId: string;
  openingId: string;
  new_stage_order: string[];
}

interface APICreateQuestionInput {
  GSI1SK: string;
  question_description: string;
}

interface AllQuestionsByStageIDInput {
  openingId: string;
  stageId: string;
  orgId: string;
}

interface DeleteQuestionInput {
  orgId: string;
  stageId: string;
  question_id: string;
}

interface APICreateApplicantInput {
  firstName: string;
  lastName: string;
  email: string;
}

interface GetAllApplicantsInStageInput {
  orgId: string;
  openingId: string;
  stageId: string;
}

// TODO this should be updated with question / answer type for multiple choice, radio, etc.
interface ApplicantAnswer {
  question_id?: string; // ID needed for client side sorting
  question_title: string;
  question_description: string;
  question_response: string;
}

type CustomDateFormat = string | number;

type CustomQuery = {
  orgId?: string;
  openingId?: string;
  userId?: string;
  stageId?: string;
  applicantId?: string;
  key?: string;
  callbackUrl?: string;
  question_id?: string;
  invite_id?: string;
};
// ---------------
// NEW TYPES!!!!!!!!!!!!!
interface EventWithUser extends APIGatewayProxyEventV2 {
  user: {}; // TODO fix this user type
}
