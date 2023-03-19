import { PlutomiId } from '../../OLD/utils';
import { IndexableType, IndexedTargetArray } from '../indexableProperties';
import { AllEntityNames } from './allEntityNames';
import { BaseEntity } from './baseEntity';

export type InviteTargetArray = [
  ...IndexedTargetArray<AllEntityNames.Invite>,
  // Get all invites for a user (to accept)
  { id: PlutomiId<AllEntityNames.User>; type: IndexableType.Invite },
  // Get all invites sent by a given user - // TODO not necessary, just filter on createdBy
  { id: `${PlutomiId<AllEntityNames.User>}#SENT`; type: IndexableType.Invite },
  // Get all invites for an org
  { id: PlutomiId<AllEntityNames.Org>; type: IndexableType.Invite },
  // Get invites associated for a given membership (should only ever be one)
  { id: PlutomiId<AllEntityNames.Membership>; type: IndexableType.Invite },
];

export type Invite = BaseEntity<AllEntityNames.Invite> & {
  org: {
    id: string;
    name: string;
  };
  createdBy: {
    // Null incase that user hasn't setup their name,
    // we show on the invite that "You have been invited" instead of by <name>
    id: string;
    name: string | null;
    email: string;
  };
  recipient: {
    id: string;
    name: string;
    email: string;
  };
  expiresAt: Date;
  target: InviteTargetArray;
};
