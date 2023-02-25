export interface EntityCount<T extends AllEntityNames> {
  applicants: number;
  applications: number;
  users: number;
  stages: number;
  webhooks: number;
  questions: number;
  invites: number;
}


type EntityCountsMapping = {
  [AllEntityNames.Application]: Pick<EntityCount<AllEntityNames.Application>, 'stages' | 'webhooks'>;
  [AllEntityNames.Invite]: Pick<EntityCount<AllEntityNames.Invite>, 'invites'>;
  [AllEntityNames.Org]: Pick<EntityCount<AllEntityNames.Org>, 'users' | 'webhooks'>;
  [AllEntityNames.User]: Pick<EntityCount<AllEntityNames.User>, 'applicants' | 'applications'>;
  [AllEntityNames.Question]: Pick<EntityCount<AllEntityNames.Question>, 'questions'>;
  [AllEntityNames.Stage]: Pick<EntityCount<AllEntityNames.Stage>, 'stages'>;
}

type EntityCounts<T extends AllEntityNames> = EntityCountsMapping[T];