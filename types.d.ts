interface NewUserInput {
  name: string;
  email: string;
  password: string;
}
interface NewUserOutput {
  PK: string;
  SK: string;
  name: string;
  email: string;
  password: string;
  entity_type: string;
  created_at: string;
  org_name: string;
  org_join_date: string;
  user_role: string;
  user_id: string;
  GSI1PK: string;
  GSI1SK: string;
  is_sub_user: boolean;
}
