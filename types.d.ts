interface CreateOrgInput {
  orgId: string; // plutomi
  GSI1SK: string; // Plutomi Inc.
  user: DynamoUser; // User creating the org - Optional on client
}

interface GetOrgInput {
  orgId: string;
}

interface CreateUserInput {
  first_name?: string;
  last_name?: string;
  user_email: string;
}

interface CreateOpeningInput {
  orgId: string;
  GSI1SK: string;
  user?: DynamoUser; // User creating the opening - Optional on client
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
  first_name: string;
  last_name: string;
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

type CustomSession = Session & { userId: string; user_email: string };

type CustomRequest = NextApiRequest & { user: DynamoUser };

type CustomJWT = JWT & { userId: string };

interface CreateOrgInviteInput {
  orgId: string;
  org_name: string;
  created_by: DynamoUser;
  recipientEmail: string; // Email of person getting invited
  expires_at: CustomDateFormat; // TODO Maybe Dynamo TTL or just ISO
  claimed: boolean;
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

interface DeleteOrgInviteInput {
  userId: string;
  timestamp: string;
  invite_id: string;
}
interface SendOrgInviteInput {
  created_by: DynamoUser;
  org_name: string;
  recipientEmail: string;
}

type StageTypes = "idle" | "active" | "frozen" | "deletion";

interface StageCardInput {
  applicant_type: StageTypes;
  stage_title: string;
  total_applicants: number;
}

interface useSelfOutput {
  user: DynamoUser;
  isUserLoading: boolean;
  isUserError: boolean;
}

interface useOrgInvitesOutput {
  invites: DynamoOrgInvite[];
  isInvitesLoading: boolean;
  isInvitesError: boolean;
}

interface useOrgUsersOutput {
  orgUsers: DynamoUser[];
  isOrgUsersLoading: boolean;
  isOrgUsersError: boolean;
}

interface useStageByIdOutput {
  stage: DynamoStage;
  isStageLoading: boolean;
  isStageError: boolean;
}

interface useOpeningByIdOutput {
  opening: DynamoOpening;
  isOpeningLoading: boolean;
  isOpeningError: boolean;
}

interface useApplicantByIdOutput {
  applicant: DynamoApplicant; // TODO - This will not be a dynamo applicant
  // But instead it wll be an applicant object with properties inside such as
  // .details, .files, .history, .messages, etc. We're going to do a query
  // To return all items in the future. For now, this is ok
  isApplicantLoading: boolean;
  isApplicantError: boolean;
}
interface useOpeningsOutput {
  openings: DynamoOpenings[];
  isOpeningsLoading: boolean;
  isOpeningsError: boolean;
}

interface usePublicOpeningsOutput {
  publicOpenings: DynamoOpenings[];
  isPublicOpeningsLoading: boolean;
  isPublicOpeningsError: boolean;
}

interface useOrgUsersOutput {
  orgUsers: DynamoUser[];
  isOrgUsersLoading: boolean;
  isOrgUsersError: boolean;
}

interface useAllStagesInOpeningOutput {
  stages: DynamoStage[];
  isStagesLoading: boolean;
  isStagesError: boolean;
}
interface useAllStageQuestionsOutput {
  questions: DynamoStageQuestion[];
  isQuestionsLoading: boolean;
  isQuestionsError: boolean;
}

interface APICreateLoginLinkInput {
  user_email: string;
  callbackUrl?: string;
}

interface APICreateQuestionInput {
  GSI1SK: string;
  question_description: string;
}

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

interface UpdateOpeningInput {
  orgId: string;
  openingId: string;
  new_opening_values: DynamoOpening;
}

interface UpdateApplicantInput {
  orgId: string;
  applicantId: string;
  new_applicant_values: DynamoApplicant;
}

interface UpdateQuestionInput {
  orgId: string;
  question_id: string;
  new_question_values: DynamoStageQuestion;
}

interface UpdateStageInput {
  orgId: string;
  stageId: string;
  new_stage_values: DynamoStage;
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

interface useOrgOutput {
  org: DynamoOrg;
  isOrgLoading: boolean;
  isOrgError: boolean;
}

interface APICreateApplicantInput {
  first_name: string;
  last_name: string;
  email: string;
}

interface GetAllApplicantsInStageInput {
  orgId: string;
  openingId: string;
  stageId: string;
}

interface useAllApplicantsInStageOutput {
  applicants: DynamoApplicant[];
  isApplicantsLoading: boolean;
  isApplicantsError: boolean;
}

// TODO this should be updated with question / answer type for multiple choice, radio, etc.
interface ApplicantAnswer {
  question_id?: string; // ID needed for client side sorting
  question_title: string;
  question_description: string;
  question_response: string;
}
type NextIronRequest = NextApiRequest & { session: Session };

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
