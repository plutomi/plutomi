// TODO add user_id
interface UserInfo {
  PK: string;
  SK: "USER";
  name: string;
  user_email: string;
  user_id: string;
  password: string;
  entity_type: "USER";
  created_at: dayjs;
  org_id: string;
  org_join_date: "NO_ORG_ASSIGNED" | Date;
  GSI1PK: string;
  GSI1SK: string;
  GSI2PK: string;
  GSI2SK: "USER";
}
interface CreateUserAPIInput {
  name: string;
  user_email: string;
  password: string;
}

interface CreateSessionAPIInput {
  user_email: string;
  password: string;
}

interface CreateOrgAPIInput {
  org_name: string;
}

interface CreateFunnelAPIInput {
  funnel_name: string;
}

interface CreateStageAPIInput {
  user_info?: {
    org_id: string;
    user_id: string;
    user_email: string;
  }; // TODO
  funnel_id: string;
  stage_name: string;
}

interface CreateStageRuleAPIInput {
  stage_id: validation;
  validation: string;
}

interface CreateStageQuestionAPIInput {
  stage_id: string;
  question_title: string;
}
