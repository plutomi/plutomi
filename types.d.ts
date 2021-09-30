interface CreateOrgInput {
  org_id: string; // plutomi
  org_name: string; // Plutomi Inc.
  user: DynamoUser; // User creating the org - Optional on client
}

interface GetOrgInput {
  org_id: string;
}

interface CreateUserInput {
  first_name?: string;
  last_name?: string;
  user_email: string;
}

interface CreateOpeningInput {
  org_id: string;
  opening_name: string;
  is_public: boolean;
  user?: DynamoUser; // User creating the opening - Optional on client
}

interface GetOpeningInput {
  org_id: string;
  opening_id: string;
}
interface CreateStageInput {
  org_id: string;
  opening_id: string;
  stage_name: string;
}

interface ValidNavigation {
  current: "Dashboard" | "Openings" | "Team" | "PLACEHOLDER";
}

interface GetStageByIdInput {
  org_id: string;
  opening_id: string;
  stage_id: string;
}

interface CreateStageQuestionInput {
  org_id: string;
  opening_id: string;
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
  applicant_first_name: string;
  applicant_last_name: string;
  applicant_email: string;
  opening_id: string;
  stage_id: string;
}

interface JoinOrgInput {
  org_id: string;
  user_id: string;
}

interface CreateLoginCodeInput {
  user_email: string;
  login_code: string;
  login_code_expiry: string; // Timestamp in the future
}

interface SendLoginCodeEmailInput {
  recipient: string;
  login_code: string;
  login_code_relative_expiry: string;
}

interface ClaimLoginCodeInput {
  user_id: string;
  timestamp: string; // SK
  claimed_at: string;
}

interface UpdateUserInput {
  body: Object;
  user_id: string;
}

interface Pokemon {
  id: number;
  name: string;
}
interface PlutomiState {
  // Create / edit questions in a stage
  questionModal: QuestionModalInput;
  setQuestionModal: Function;

  // Create / edit openings
  openingModal: OpeningModalInput;
  setOpeningModal: Function;

  // TODO
  setCreateOrgModalOpen: Function;
  createOrgModalIsOpen: boolean;
  createStageModalIsOpen: boolean;
  setCreateStageModalOpen: Function;
  openingsSearchInput: string;
  setOpeningsSearchInput: Function;
  createInviteModalIsOpen: boolean;
  setCreateInviteModalOpen: Function;

  // Question Modal
  questionModalMode: "CREATE" | "EDIT";
  questionModalTitle: string; // TODO this is stupidly gross
  questionModalDescription: string;
  questionModalId: string;
}

interface DynamoUser {
  created_at?: string; // "2021-09-04T15:12:42.646Z";
  entity_type?: string; // "USER";
  user_email?: string; // "joseyvalerio@gmail.com";
  org_id?: string; // "NO_ORG_ASSIGNED";
  full_name?: string; // "JoseV2 valerio";
  GSI1SK?: string; // "NO_FIRST_NAME NO_LAST_NAME";
  GSI2SK?: string; // "USER";
  GSI2PK?: string; // "joseyvalerio@gmail.com";
  GSI1PK?: string; // "ORG#NO_ORG_ASSIGNED#USERS";
  user_id?: string; // "VFQg-GZJvxICh5Y7JBanZCehc22p03";
  last_name?: string; // "valerio";
  org_join_date?: string; // "NO_ORG_ASSIGNED";
  first_name?: string; // "JoseV2";
  SK?: string; // "USER";
  PK?: string; // "USER#VFQg-GZJvxICh5Y7JBanZCehc22p03";
}

type CustomSession = Session & { user_id: string };

type CustomRequest = NextApiRequest & { user: DynamoUser };

type CustomJWT = JWT & { user_id: string };

/**
 * @param org_id - test
 */
interface CreateOrgInviteInput {
  org_id: string;
  invited_by: DynamoUser;
  recipient: string; // Email of person getting invited
  expires_at: string; // TODO Maybe Dynamo TTL or just ISO
  claimed: boolean;
}

interface GetOrgInviteInput {
  user_id: string;
  timestamp: string;
  invite_id: string;
}

interface AcceptOrgInviteInput {
  user_id: string;
  timestamp: string;
  invite_id: string;
}

interface DeleteOrgInviteInput {
  user_id: string;
  timestamp: string;
  invite_id: string;
}
interface SendOrgInviteInput {
  invited_by: DynamoUser;
  org_id: string;
  recipient: string;
}

type StageTypes = "idle" | "active" | "frozen" | "deletion";

interface StageCardInput {
  applicant_type: StageTypes;
  stage_title: string;
  num_applicants: number;
}

interface useUserOutput {
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

interface APICreateLoginCodeInput {
  user_email: string;
}

interface APICreateOpeningInput {
  opening_name: string;
  is_public: boolean;
}

interface APICreateStageInput {
  stage_name: string;
}

interface APICreateQuestionInput {
  GSI1SK: string;
  question_description: string;
}

interface APICreateRuleInput {
  validation: string; // I believe this will be a template string combination.
}

interface APICreateOrgInput {
  org_name: string;
  org_id: string;
}

interface APICreateOrgInviteInput {
  recipient: string;
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
  opening_id: string;
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

interface UpdateOpeningInput {
  org_id: string;
  opening_id: string;
  updated_opening: DynamoOpening;
}

interface UpdateQuestionInput {
  org_id: string;
  opening_id: string;
  stage_id: string;
  question_id: string;
  updated_question: DynamoStageQuestion;
}

interface UpdateStageInput {
  org_id: string;
  opening_id: string;
  stage_id: string;
  updated_stage: DynamoStage;
}
interface APIUpdateOpeningInput {
  updated_opening: DynamoOpening;
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
  opening_id: string;
  stage_id: string;
  question_id: string;
}

interface QuestionModalInput {
  is_modal_open: boolean;
  modal_mode: "EDIT" | "CREATE"; // Will render text differently
  question_id: "";
  GSI1SK: "";
  question_description: "";
}

interface OpeningModalInput {
  is_modal_open: boolean;
  modal_mode: "EDIT" | "CREATE"; // Will render text differently
  opening_id: "";
  opening_name: "";
  is_public: boolean;
}
