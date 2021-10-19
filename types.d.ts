interface CreateOrgInput {
  org_id: string; // plutomi
  GSI1SK: string; // Plutomi Inc.
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
  GSI1SK: string;
  is_public: boolean;
  user?: DynamoUser; // User creating the opening - Optional on client
}

interface GetOpeningInput {
  org_id: string;
  opening_id: string;
}
interface GetApplicantInput {
  org_id: string;
  applicant_id: string;
}
interface CreateStageInput {
  org_id: string;
  opening_id: string;
  GSI1SK: string;
}

interface ValidNavigation {
  current:
    | "Dashboard"
    | "Openings"
    | "Team"
    | "Invites"
    | "Profile"
    | "PLACEHOLDER";
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
interface JoinOrgInput {
  org_id: string;
  user_id: string;
}

interface CreateLoginLinkInput {
  user_email: string;
  login_link_hash: string;
  login_link_expiry: string; // Timestamp in the future
}

interface SendLoginLinkEmailInput {
  recipient: string;
  login_link: string;
  login_link_relative_expiry: string;
}

interface SendApplicantLinkInput {
  org_id: string;
  org_name: string;
  applicant_id: string;
  applicant_email: string;
}
interface UpdateUserInput {
  updated_user: DynamoUser;
  user_id: string;
}

interface APIUpdateUserInput {
  updated_user: DynamoUser;
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

  // Create / edit stages
  stageModal: StageModalInput;
  setStageModal: Function;

  // Edit user
  userProfileModal: UserProfileModalInput;
  setUserProfileModal: Function;

  // Edit applicant
  applicantProfileModal: ApplicantProfileModalInput;
  setApplicantProfileModal: Function;

  // TODO
  setCreateOrgModalOpen: Function;
  createOrgModalIsOpen: boolean;
  openingsSearchInput: string;
  setOpeningsSearchInput: Function;
  createInviteModalIsOpen: boolean;
  setCreateInviteModalOpen: Function;
}

type CustomSession = Session & { user_id: string; user_email: string };

type CustomRequest = NextApiRequest & { user: DynamoUser };

type CustomJWT = JWT & { user_id: string };

/**
 * @param org_id - test
 */
interface CreateOrgInviteInput {
  org_id: string;
  org_name: string;
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
  org_name: string;
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
  callback_url?: string;
}

interface APICreateOpeningInput {
  GSI1SK: string;
  is_public: boolean;
}

interface APICreateStageInput {
  GSI1SK: string;
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

interface UpdateApplicantInput {
  org_id: string;
  applicant_id: string;
  updated_applicant: DynamoApplicant;
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

interface StageModalInput {
  is_modal_open: boolean;
  modal_mode: "EDIT" | "CREATE"; // Will render text differently
  stage_id: "";
  GSI1SK: "";
}
interface UserProfileModalInput {
  is_modal_open: boolean;
  modal_mode: "EDIT" | "CREATE"; // Will render text differently
  first_name: "";
  last_name: "";
}

interface ApplicantProfileModalInput {
  is_modal_open: boolean;
}

interface OpeningModalInput {
  is_modal_open: boolean;
  modal_mode: "EDIT" | "CREATE"; // Will render text differently
  opening_id: "";
  GSI1SK: "";
  is_public: boolean;
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
  org_id: string;
  opening_id: string;
  stage_id: string;
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
