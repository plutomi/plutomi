interface CreateOrgInput {
  org_url_name: string; // plutomi
  org_official_name: string; // Plutomi Inc.
}

interface GetOrgInput {
  org_url_name: string; // plutomi
}

interface CreateUserInput {
  first_name: string;
  last_name: string;
  user_email: string;
  password: string;
}
