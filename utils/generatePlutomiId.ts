import ksuid from 'ksuid';

type PlutomiIdSuffix = `_${string}`;

export enum AllEntityNames {
  Org = 'Org',
  User = 'User',
  Application = 'Application',
  Applicant = 'Applicant',
  Stage = 'Stage',
  Question = 'Question',
  Invite = 'Invite',
  Webhook = 'Webhook',
  Event = 'Event',
  Session = 'Session',
  LoginLink = 'LoginLink',
}

export type EntityKeys = keyof typeof AllEntityNames;
type EntityIdPrefixes = {
  [K in EntityKeys]: Lowercase<K>;
};

export const EntityIdPrefixes: EntityIdPrefixes = {
  [AllEntityNames.User]: 'user',
  [AllEntityNames.Org]: 'org',
  [AllEntityNames.Application]: 'application',
  [AllEntityNames.Applicant]: 'applicant',
  [AllEntityNames.Stage]: 'stage',
  [AllEntityNames.Question]: 'question',
  [AllEntityNames.Invite]: 'invite',
  [AllEntityNames.Webhook]: 'webhook',
  [AllEntityNames.Event]: 'event',
  [AllEntityNames.Session]: 'session',
  [AllEntityNames.LoginLink]: 'loginlink',
};

export type PlutomiId<T extends EntityKeys> = `${EntityIdPrefixes[T]}${PlutomiIdSuffix}`;

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
}: GenerateIdProps<T>): PlutomiId<T> => {
  const id = ksuid.randomSync(date).string;
  const prefix = EntityIdPrefixes[entity];

  return `${prefix}_${id}`;
};
