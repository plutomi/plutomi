import { AllEntityNames } from './allEntityNames';

type EntityCountsMapping = {
  [AllEntityNames.Application]: { [Pick<AllEntityNames, 'stage'>]: number };
  // [AllEntityNames.Invite]: Pick<EntityCounts, 'invites'>;
  // [AllEntityNames.Org]: Pick<EntityCounts, 'users' | 'webhooks'>;
  // [AllEntityNames.User]: Pick<EntityCounts, 'applicants' | 'applications'>;
  // [AllEntityNames.Question]: Pick<EntityCounts, 'questions'>;
  // [AllEntityNames.Stage]: Pick<EntityCounts, 'stages'>;
};


type EntityCounts = {
  [K in keyof typeof AllEntityNames]: {
    [P in keyof Pick<typeof AllEntityNames, K>]: number;
  };
};

// Example usage
const entityValues: EntityCounts = {
  Org: { invite: 42 },
  User: { email: 123, password: 456 },
  Application: { description: 789 },
  // ...
};


type EntityCount<T extends keyof EntityCountsMapping> = EntityCountsMapping[T];


// TODO chatgpt

// type EntityKeys = keyof typeof AllEntities;

// type EntityProperties = {
//   [AllEntities.User]: {
//     email: string;
//     password: string;
//   };
//   [AllEntities.Org]: {
//     location: string;
//   };
//   [AllEntities.Application]: {
//     description: string;
//   };
//   // Add more entities here...
// };

// type EntityProperty<T extends EntityKeys> = T extends keyof EntityProperties
//   ? EntityProperties[T]
//   : never;

// type EntityObject<T extends EntityKeys> = {
//   id: PlutomiId<T>;
// } & EntityProperty<T>;