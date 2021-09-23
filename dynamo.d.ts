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

interface DynamoFunnel {
  // PK: `ORG#${org_id}#FUNNEL#${funnel_id}`,
  // SK: `FUNNEL`,
  // funnel_name: funnel_name,
  // entity_type: "FUNNEL",
  // created_at: now,
  // funnel_id: funnel_id,
  // GSI1PK: `ORG#${org_id}#FUNNELS`,
  // GSI1SK: funnel_name,
  PK: string;
  SK: "FUNNEL";
  funnel_name: string;
  entity_type: "FUNNEL";
  created_at: string; // ISO
  funnel_id: string;
  GSI1PK: string;
  GSI1SK: string;
}
