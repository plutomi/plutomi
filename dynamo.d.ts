// Types for the actual items that go into Dynamo DB
// Makes it easier to reference all variables in the front end

interface DynamoUser {
  // PK: `USER#${user_id}`,
  // SK: `USER`,
  // first_name: first_name || "NO FIRST NAME",
  // last_name: last_name || "NO LAST NAME",
  // user_email: user_email,
  // user_id: user_id,
  // entity_type: "USER",
  // created_at: now,
  // org_id: "NO_ORG_ASSIGNED",
  // org_join_date: "NO_ORG_ASSIGNED",
  // GSI1PK: "ORG#NO_ORG_ASSIGNED#USERS",
  // GSI1SK: `${first_name} ${last_name}`,
  // GSI2PK: user_email,
  // GSI2SK: "USER",
  PK: string;
  SK: "USER";
  first_name: string;
  last_name: string;
  user_email: string;
  user_id: string;
  entity_type: "USER";
  created_at: string;
  org_id: string;
  org_join_date: string;
  GSI1PK: string;
  GSI1SK: string;
  GSI2PK: string;
  GSI2SK: "USER";
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
  question_order: string[];
  opening_id: string;
  GSI1PK: string;
  GSI1SK: string;
}

interface DynamoOrgInvite {
  // PK: `USER#${user.user_id}`;
  // SK: `ORG_INVITE#${now}#INVITE_ID#${invite_id}`; // Allows sorting, and incase two get created in the same millisecond
  // org_id: org_id;
  // invited_by: invited_by;
  // entity_type: "ORG_INVITE";
  // created_at: now;
  // expires_at: expires_at;
  // invite_id: invite_id;
  // GSI1PK: `ORG#${org_id}#ORG_INVITES`;
  // GSI1SK: now;

  PK: string;
  SK: string;
  org_id: string;
  invited_by: DynamoUser;
  entity_type: "ORG_INVITE";
  created_at: string;
  expires_at: string;
  invite_id: string;
  GSI1PK: string;
  GSI1SK: string;
}

interface DynamoStageQuestion {
  // PK: `ORG#${org_id}#OPENING#${opening_id}#STAGE#${stage_id}`,
  // SK: `STAGE_QUESTION#${stage_question_id}`,
  // question_description: question_description,
  //     question_id: stage_question_id,
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
}
