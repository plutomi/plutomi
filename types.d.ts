interface CreateOrgInput {
  org_url_name: string; // plutomi
  org_official_name: string; // Plutomi Inc.
}

interface GetOrgInput {
  org_url_name: string;
}

interface CreateUserInput {
  first_name: string;
  last_name: string;
  user_email: string;
  password: string;
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
