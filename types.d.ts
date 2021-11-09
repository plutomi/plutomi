import { APIGatewayProxyEventV2 } from "aws-lambda";

interface GetOrgInput {
  org_id: string;
}

interface CreateUserInput {
  first_name?: string;
  last_name?: string;
  user_email: string;
}

interface GetOpeningInput {
  org_id: string;
  opening_id: string;
}
interface GetApplicantInput {
  org_id: string;
  applicant_id: string;
}
interface DynamoCreateStageInput {
  org_id: string;
  opening_id: string;
  GSI1SK: string;
}

interface GetStageInput {
  org_id: string;
  stage_id: string;
}

interface CreateStageQuestionInput {
  org_id: string;
  stage_id: string;
  GSI1SK: string;
  question_description: string;
}

interface CreateStageRuleInput {
  org_id: string;
  opening_id: string;
  stage_id: string;
  validation: string; // TODO
}

interface CreateApplicantInput {
  org_id: string;
  first_name: string;
  last_name: string;
  email: string;
  opening_id: string;
  stage_id: string;
}

interface CreateApplicantResponseInput {
  org_id: string;
  applicant_id: string;
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
  org_id: string;
}

interface APICreateOrgInviteInput {
  recipient_email: string;
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
  org_id: string;
  stage_id: string;
}

interface APIReorderStagesInput {
  new_stage_order: string[];
}

interface ReorderStagesInput {
  org_id: string;
  opening_id: string;
  new_stage_order: string[];
}

interface APICreateQuestionInput {
  GSI1SK: string;
  question_description: string;
}

interface AllQuestionsByStageIDInput {
  opening_id: string;
  stage_id: string;
  org_id: string;
}

interface DeleteQuestionInput {
  org_id: string;
  stage_id: string;
  question_id: string;
}

interface APICreateApplicantInput {
  first_name: string;
  last_name: string;
  email: string;
}

interface GetAllApplicantsInStageInput {
  org_id: string;
  opening_id: string;
  stage_id: string;
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
  org_id?: string;
  opening_id?: string;
  userId?: string;
  stage_id?: string;
  applicant_id?: string;
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
