interface CreateOrgInput {
  org_url_name: string; // plutomi
  org_official_name: string; // Plutomi Inc.
}

interface GetOrgInput {
  org_url_name: string;
}

interface CreateUserInput {
  first_name?: string;
  last_name?: string;
  user_email: string;
}

interface CreateFunnelInput {
  org_url_name: string;
  funnel_name: string;
}

interface GetFunnelInput {
  org_url_name: string;
  funnel_id: string;
}
interface CreateStageInput {
  org_url_name: string;
  funnel_id: string;
  stage_name: string;
}

interface GetStageInput {
  org_url_name: string;
  funnel_id: string;
  stage_id: string;
}

interface CreateStageQuestionInput {
  org_url_name: string;
  funnel_id: string;
  stage_id: string;
  question_title: string;
  question_description: string;
}

interface CreateStageRuleInput {
  org_url_name: string;
  funnel_id: string;
  stage_id: string;
  validation: string; // TODO
}

interface CreateApplicantInput {
  org_url_name: string;
  applicant_first_name: string;
  applicant_last_name: string;
  applicant_email: string;
  funnel_id: string;
  stage_id: string;
}

interface JoinOrgInput {
  org_url_name: string;
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
