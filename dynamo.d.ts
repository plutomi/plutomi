/**
 * @property {PK} - The user object
 */
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
  SK: string;
  first_name: string;
  last_name: string;
  user_email: string;
  user_id: string;
  entity_type: "USER";
  created_at: Date;
  org_id: string;
  org_join_date: string;
  GSI1PK: string;
  GSI1SK: string;
  GSI2PK: string;
  GSI2SK: "USER";
}
