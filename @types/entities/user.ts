import { PlutomiId } from '../../utils';
import { IndexableType, IndexedTargetArray } from '../indexableProperties';
import { AllEntityNames } from './allEntityNames';
import { BaseEntity } from './baseEntity';
import { UserTotals } from './totalsCount';

type Entity = AllEntityNames.User;

type UserTargetArray = IndexedTargetArray<Entity> &
  [
    // Get all users in an org
    { id: PlutomiId<AllEntityNames.Org>; type: IndexableType.User },
    // All users in a workspace
    { id: PlutomiId<AllEntityNames.Workspace>; type: IndexableType.User },
  ];

export type UserEntity = BaseEntity<Entity> & {
  org: string | null; // ! TODO multiple orgs, stored on session
  orgJoinDate?: Date; // ! TODO: this should be on the org or another org event object
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  canReceiveEmails: boolean;
  totals: UserTotals;
  target: UserTargetArray;
};
