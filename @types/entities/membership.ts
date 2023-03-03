import { PlutomiId } from '../../utils';
import { IndexableType, IndexedTargetArray } from '../indexableProperties';
import { AllEntityNames } from './allEntityNames';
import { BaseEntity } from './baseEntity';
import { OrgTotals } from './totalsCount';

/**
 * Memberships are the link between users and workspaces. A user can be in many workspaces, and a workspace can have many users.
 * An example would be a recruiting firm that creates a workspace per client.
 * Each client would have a workspace, and each recruiter would be a user in that workspace.
 * Not all recruiters need access to every workspace, even though they are all part of the same organization.
 *
 * In the future, you can invite outside recruiters to certain workspaces but not for others inside of your org.
 * For more info, see this post: https://blitzjs.com/docs/multitenancy
 */
type Entity = AllEntityNames.Membership;

type MembershipTargetArray = IndexedTargetArray<Entity> &
  [

    { id: PlutomiId<AllEntityNames.Org>; type: IndexableType.Membership },
    // Get all memberships for a user and with it, all the workspaces they are in
    { id: PlutomiId<AllEntityNames.User>; type: IndexableType.Membership },
  ];

export type Membership = BaseEntity<Entity> & {
  displayName: string;
  totals: OrgTotals;
  target: MembershipTargetArray;
};
