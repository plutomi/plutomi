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
  [AllEntityNames.User]: 'usr',
  [AllEntityNames.Org]: 'org',
  [AllEntityNames.Application]: 'appl',
  [AllEntityNames.Applicant]: 'apcnt',
  [AllEntityNames.Stage]: 'stg',
  [AllEntityNames.StageRule]: 'stgrul',
  [AllEntityNames.Question]: 'ques',
  [AllEntityNames.QuestionRule]: 'quesrul',
  [AllEntityNames.Invite]: 'inv',
  [AllEntityNames.Webhook]: 'wbhk',
  [AllEntityNames.Event]: 'evnt',
  [AllEntityNames.Session]: 'sesh',
  [AllEntityNames.LoginLink]: 'lgnlnk',
} as const;

type ksuidIdString = `_${string}`;

interface GenerateIdProps<T> {
  /**
   * Manually generated createdAt date.
   * There will be a top level `createdAt`
   * and this ensures that the ID and that value have the same date
   */
  date: Date;
  entity: T;
}

export type PlutomiId<T extends AllEntityNames> = `${typeof EntityPrefixes[T]}${ksuidIdString}`;

export const generatePlutomiId = <T extends AllEntityNames>({
  date,
  entity,
}: GenerateIdProps<T>): PlutomiId<T> => {
  const id = ksuid.randomSync(date).string;
  const prefix = EntityPrefixes[entity];

  return `${prefix}_${id}`;
};
