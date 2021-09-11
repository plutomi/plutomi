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

interface CreateFunnelInput {
  org_id: string;
  funnel_name: string;
}

interface GetFunnelInput {
  org_id: string;
  funnel_id: string;
}
interface CreateStageInput {
  org_id: string;
  funnel_id: string;
  stage_name: string;
}

interface GetStageByIdInput {
  org_id: string;
  stage_id: string;
}

interface CreateStageQuestionInput {
  org_id: string;
  funnel_id: string;
  stage_id: string;
  question_title: string;
  question_description: string;
}

interface CreateStageRuleInput {
  org_id: string;
  funnel_id: string;
  stage_id: string;
  validation: string; // TODO
}

interface CreateApplicantInput {
  org_id: string;
  applicant_first_name: string;
  applicant_last_name: string;
  applicant_email: string;
  funnel_id: string;
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
interface NewSate {
  pokemons: Pokemon[];
  removePokemon: Function;
  setCreateOrgModalOpen: Function;
  createOrgModalIsOpen: boolean;
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

interface SendOrgInviteInput {
  invited_by: DynamoUser;
  org_id: string;
  recipient: string;
}
