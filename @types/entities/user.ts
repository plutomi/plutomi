import { PlutomiId } from '../../utils';
import { IndexableType, IndexedTargetArray } from '../indexableProperties';
import { AllEntityNames } from './allEntityNames';
import { BaseEntity } from './baseEntity';

type UserTotals = {
  invites: number;
  memberships: number;
  workspaces: number;
};

type Entity = AllEntityNames.User;

type UserTargetArray = IndexedTargetArray<AllEntityNames.User> &
  [
    // Get all users in an org
    { id: PlutomiId<AllEntityNames.Org> | null; type: IndexableType.User },
    // Get all users in a workspace
    { id: PlutomiId<AllEntityNames.Workspace> | null; type: IndexableType.User },
    // Get a user by email
    { id: `${string}@${string}.${string}`; type: IndexableType.Email },
  ];

export type User = BaseEntity<Entity> & {
  firstName: string;
  lastName: string;
  org: PlutomiId<AllEntityNames.Org> | null;
  emailVerified: boolean;
  canReceiveEmails: boolean;
  totals: UserTotals;
  target: UserTargetArray;
};
