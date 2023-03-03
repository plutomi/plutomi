import { PlutomiId } from '../../utils';
import { IndexableType, IndexedTargetArray } from '../indexableProperties';
import { AllEntityNames } from './allEntityNames';
import { BaseEntity } from './baseEntity';

export type Entity = AllEntityNames.Invite;

export type InviteTargetArray = IndexedTargetArray<Entity> &
  [
    // Get all invites for a user
    { id: PlutomiId<AllEntityNames.User>; type: IndexableType.Invite },
    // Get all invites for an org - // TODO memberships?
    { id: PlutomiId<AllEntityNames.Org>; type: IndexableType.Invite },
  ];
export type InviteEntity = BaseEntity<Entity> & {
  userId: string;
  /**
   * Display name and createdBy denormalized for convenience
   */
  org: {
    id: string;
    name: string;
  };
  createdBy: {
    name: string | null; // TODO Why would this ever be null?
    email: string;
  };
  recipientName: string | null;
  expiresAt: Date;
  target: InviteTargetArray;
};
