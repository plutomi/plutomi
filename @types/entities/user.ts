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
    // Get all users in a workspace
    { id: PlutomiId<AllEntityNames.Workspace>; type: IndexableType.User },
  ];

export type UserEntity = BaseEntity<Entity> & {
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  canReceiveEmails: boolean;
  totals: UserTotals;
  target: UserTargetArray;
};
