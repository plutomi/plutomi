import ksuid from 'ksuid';

export enum AllEntities {
  Org = 'Org',
  User = 'User',
  Application = 'Application',
  Applicant = 'Applicant',
  Stage = 'Stage',
  Question = 'Question',
  Invite = 'Invite',
  Webhook = 'Webhook',
  StageRule = 'StageRule',
  QuestionRule = 'QuestionRule',
  Event = 'Event',
  Session = 'Session',
  LoginLink = 'LoginLink',
}

export const EntityPrefixes = {
  [AllEntities.User]: 'usr_',
  [AllEntities.Org]: 'org_',
  [AllEntities.Application]: 'appl_',
  [AllEntities.Applicant]: 'apcnt_',
  [AllEntities.Stage]: 'stg_',
  [AllEntities.StageRule]: 'stgrul_',
  [AllEntities.Question]: 'ques_',
  [AllEntities.QuestionRule]: 'quesrul_',
  [AllEntities.Invite]: 'inv_',
  [AllEntities.Webhook]: 'wbhk_',
  [AllEntities.Event]: 'evnt_',
  [AllEntities.Session]: 'sesh_',
  [AllEntities.LoginLink]: 'lgnlnk_',
} as const;

interface GenerateIdProps<T> {
  /**
   * Manually generated createdAt date.
   * There will be a top level `createdAt`
   * and this ensures that the ID and that value have the same date
   */
  date: Date;
  entity: T;
}

export const generatePlutomiId = <T extends AllEntities>({
  date,
  entity,
}: GenerateIdProps<T>): `${typeof EntityPrefixes[T]}${string}` => {
  const id = ksuid.randomSync(date).string;
  const prefix = EntityPrefixes[entity];

  return `${prefix}${id}`;
};
