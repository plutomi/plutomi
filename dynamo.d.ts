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
  // opening_name: opening_name,
  // entity_type: "OPENING",
  // created_at: now,
  // opening_id: opening_id,
  // GSI1PK: `ORG#${org_id}#OPENINGS`,
  // GSI1SK: opening_name,
  PK: string;
  SK: "OPENING";
  opening_name: string;
  entity_type: "OPENING";
  created_at: string; // ISO
  opening_id: string;
  GSI1PK: string;
  GSI1SK: string;
}

interface DynamoStage {
  // PK: `ORG#${org_id}#OPENING#${opening_id}#STAGE#${stage_id}`;
  // SK: `STAGE`;
  // stage_name: stage_name;
  // entity_type: "STAGE";
  // created_at: now;
  // stage_id: stage_id;
  // opening_id: opening_id;
  // GSI1PK: `ORG#${org_id}#OPENING#${opening_id}#STAGES`; // Get all stages in an opening
  // GSI1SK: stage_name;
  PK: string;
  SK: `STAGE`;
  stage_name: string;
  entity_type: "STAGE";
  created_at: string;
  stage_id: string;
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
  invited_by: string;
  entity_type: "ORG_INVITE";
  created_at: string;
  expires_at: string;
  invite_id: string;
  GSI1PK: string;
  GSI1SK: string;
}
