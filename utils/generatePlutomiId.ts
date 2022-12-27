import ksuid from 'ksuid';

export enum AllEntityNames {
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
  [AllEntityNames.User]: 'usr_',
  [AllEntityNames.Org]: 'org_',
  [AllEntityNames.Application]: 'appl_',
  [AllEntityNames.Applicant]: 'apcnt_',
  [AllEntityNames.Stage]: 'stg_',
  [AllEntityNames.StageRule]: 'stgrul_',
  [AllEntityNames.Question]: 'ques_',
  [AllEntityNames.QuestionRule]: 'quesrul_',
  [AllEntityNames.Invite]: 'inv_',
  [AllEntityNames.Webhook]: 'wbhk_',
  [AllEntityNames.Event]: 'evnt_',
  [AllEntityNames.Session]: 'sesh_',
  [AllEntityNames.LoginLink]: 'lgnlnk_',
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

export const generatePlutomiId = <T extends AllEntityNames>({
  date,
  entity,
}: GenerateIdProps<T>): `${typeof EntityPrefixes[T]}${string}` => {
  const id = ksuid.randomSync(date).string;
  const prefix = EntityPrefixes[entity];

  return `${prefix}${id}`;
};
