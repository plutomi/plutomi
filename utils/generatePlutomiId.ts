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

export const EntityPrefixes: Record<keyof AllEntityNames, AllEntityNames> = {
  [AllEntityNames.User]: 'user',
  [AllEntityNames.Org]: 'org',
  [AllEntityNames.Application]: 'application',
  [AllEntityNames.Applicant]: 'applicant',
  [AllEntityNames.Stage]: 'stage',
  [AllEntityNames.StageRule]: 'stagerule',
  [AllEntityNames.Question]: 'question',
  [AllEntityNames.QuestionRule]: 'questionrule',
  [AllEntityNames.Invite]: 'invite',
  [AllEntityNames.Webhook]: 'webhook',
  [AllEntityNames.Event]: 'event',
  [AllEntityNames.Session]: 'session',
  [AllEntityNames.LoginLink]: 'loginlink',
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
