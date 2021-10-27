// Types for the actual items that go into Dynamo DB
// Makes it easier to reference all variables in the front end

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
  org_invites;
  PK?: string; // "USER#VFQg-GZJvxICh5Y7JBanZCehc22p03";
}

interface DynamoOpening {
  // PK: `ORG#${org_id}#OPENING#${opening_id}`,
  // SK: `OPENING`,
  // entity_type: "OPENING",
  // created_at: now,
  // opening_id: opening_id,
  // GSI1PK: `ORG#${org_id}#OPENINGS`,
  // GSI1SK: GSI1SK,
  // is_public: false,
  // stage_order: [stage_id_1, stage_id_2]
  PK: string;
  SK: "OPENING";
  entity_type: "OPENING";
  created_at: string; // ISO
  opening_id: string;
  GSI1PK: string;
  GSI1SK: string;
  total_applicants: number;
  is_public: boolean;
  stage_order: string[];
}

interface DynamoStage {
  // PK: `ORG#${org_id}#OPENING#${opening_id}#STAGE#${stage_id}`;
  // SK: `STAGE`;
  // entity_type: "STAGE";
  // created_at: now;
  // stage_id: stage_id;
  // question_order: [],
  // opening_id: opening_id;
  // GSI1PK: `ORG#${org_id}#OPENING#${opening_id}#STAGES`; // Get all stages in an opening
  // GSI1SK: GSI1SK;
  PK: string;
  SK: `STAGE`;
  entity_type: "STAGE";
  created_at: string;
  stage_id: string;
  total_applicants: number;
  question_order: string[];
  opening_id: string;
  GSI1PK: string;
  GSI1SK: string;
}

interface DynamoOrgInvite {
  // PK: `USER#${user.user_id}`;
  // SK: `ORG_INVITE#${now}#INVITE_ID#${invite_id}`; // Allows sorting, and incase two get created in the same millisecond
  // org_id: org_id;
  // created_by: created_by;
  // entity_type: "ORG_INVITE";
  // created_at: now;
  // expires_at: expires_at;
  // invite_id: invite_id;
  // GSI1PK: `ORG#${org_id}#ORG_INVITES`;
  // GSI1SK: now;

  PK: string;
  SK: string;
  org_id: string;
  created_by: DynamoUser;
  entity_type: "ORG_INVITE";
  created_at: string;
  expires_at: string;
  invite_id: string;
  GSI1PK: string;
  GSI1SK: string;
}

interface DynamoStageQuestion {
  // PK: `ORG#${org_id}#OPENING#${opening_id}#STAGE#${stage_id}`,
  // SK: `STAGE_QUESTION#${question_id}`,
  // question_description: question_description,
  //     question_id: question_id,
  // entity_type: "STAGE_QUESTION",
  // created_at: now,
  // GSI1PK: `ORG#${org_id}#QUESTIONS`,
  // GSI1SK: GSI1SK, // TODO filter by opening by stage?

  PK: string;
  SK: string;
  question_description: string;
  question_id: string;
  entity_type: string;
  created_at: string;
  GSI1PK: string;
  GSI1SK: string;
}

interface DynamoOrg {
  // PK: `ORG#${org_id}`,
  // SK: `ORG`,
  // org_id: org_id, // plutomi - Cannot be changed
  // entity_type: "ORG",
  // created_at: now,
  // GSI1PK: `ORG`, // Allows for 'get all orgs' query
  // GSI1SK: `ORG#${GSI1SK}`, // Actual org name ie: Plutomi Inc - Can be changed!
  PK: string;
  SK: `ORG`;
  org_id: string; // plutomi - Cannot be changed
  entity_type: "ORG";
  created_at: string;
  GSI1PK: `ORG`; // Allows for 'get all orgs' query
  GSI1SK: string; // Actual org name ie: Plutomi Inc - Can be changed!
  total_users: number;
  total_openings: number;
  total_stages: number;
  total_applicants: number;
}

interface DynamoApplicant {
  PK: string;
  SK: `APPLICANT`;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  email_verified: boolean;
  applicant_id: string;
  org_id: string;
  entity_type: "APPLICANT";
  created_at: CustomDateFormat;
  current_opening_id: string;
  current_stage_id: string;
  GSI1PK: string;
  GSI1SK: string;
  responses?: DynamoApplicantResponse[]; // Now is returned when getting applicant by ID

  // PK: `ORG#${org_id}#APPLICANT#${applicant_id}`;
  // SK: `APPLICANT`;
  // first_name: first_name;
  // last_name: last_name;
  // full_name: `${first_name} ${last_name}`;
  // email: email;
  // email_verified: false;
  // applicant_id: applicant_id;
  // entity_type: "APPLICANT";
  // created_at: now;
  // current_opening_id: opening_id;
  // current_stage_id: stage_id;
  // GSI1PK: `ORG#${org_id}#APPLICANTS`;
  // GSI1SK: `OPENING#${opening_id}#STAGE#${stage_id}`;
}

interface DynamoApplicantResponse {
  PK: string;
  SK: `APPLICANT_RESPONSE`;
  org_id: string;
  applicant_id: string;
  entity_type: "APPLICANT_RESPONSE";
  question_title: string;
  question_description: string;
  question_response: any;
  created_at: string;
  response_id: string;
  GSI1PK: string;
  GSI1SK: APPLICANT_RESPONSE;
}
