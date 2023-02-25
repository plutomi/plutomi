import ksuid from 'ksuid';

type PlutomiIdSuffix = `_${string}`;

export enum AllEntities {
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

type EntityKeys = keyof typeof AllEntities;
type EntityIdPrefixes = {
  [K in EntityKeys]: Lowercase<K>;
};

export const EntityIdPrefixes: EntityIdPrefixes = {
  [AllEntities.User]: 'user',
  [AllEntities.Org]: 'org',
  [AllEntities.Application]: 'application',
  [AllEntities.Applicant]: 'applicant',
  [AllEntities.Stage]: 'stage',
  [AllEntities.Question]: 'question',
  [AllEntities.Invite]: 'invite',
  [AllEntities.Webhook]: 'webhook',
  [AllEntities.Event]: 'event',
  [AllEntities.Session]: 'session',
  [AllEntities.LoginLink]: 'loginlink',
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

export const generatePlutomiId = <T extends AllEntities>({
  date,
  entity,
}: GenerateIdProps<T>): PlutomiId<T> => {
  const id = ksuid.randomSync(date).string;
  const prefix = EntityIdPrefixes[entity];

  return `${prefix}_${id}`;
};
