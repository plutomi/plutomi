import type { RelatedToType, RelatedToArray } from "../indexableProperties";
import type { PlutomiId } from "../plutomiId";
import type { IdPrefix } from "./idPrefix";
import type { BaseEntity } from "./baseEntity";

export enum OrgRole {
  // Creator of the org
  OWNER = "owner"
}

export enum WorkspaceRole {
  // Creator of the workspace
  OWNER = "owner"
}

export enum MembershipStatus {
  // User has been invited to join the workspace, but has not accepted yet
  PENDING = "pending",
  // User has accepted the invitation to join the workspace, or created one themselves
  ACTIVE = "active"
}

/**
 * Memberships are the link between users, workspaces, and orgs.
 * An org can have many workspaces, which in turn can have many users, and they can belong to multiple workspaces.
 * An example would be a recruiting firm that creates a workspace per client.
 * Each client would have a workspace, and each recruiter would be a user in that workspace.
 * Not all recruiters need access to every workspace, even though they are all part of the same organization.
 *
 * For more info, see this post: https://blitzjs.com/docs/multitenancy
 */

type MembershipRelatedToArray = [
  ...RelatedToArray<IdPrefix.MEMBERSHIP>,
  // Get all members of an org
  { id: PlutomiId<IdPrefix.ORG>; type: RelatedToType.MEMBERSHIPS },
  // Get all memberships for a workspace and with it, all the users in that workspace
  { id: PlutomiId<IdPrefix.WORKSPACE>; type: RelatedToType.MEMBERSHIPS },
  // Get all memberships for a user and with it, all the workspaces they are in
  { id: PlutomiId<IdPrefix.USER>; type: RelatedToType.MEMBERSHIPS }
];

export type Membership = BaseEntity<IdPrefix.MEMBERSHIP> & {
  org: PlutomiId<IdPrefix.ORG>;
  orgRole: OrgRole;
  /**
   * When logging in, we need to know which workspace to redirect to.
   */
  isDefault: boolean;
  workspace: PlutomiId<IdPrefix.WORKSPACE>;
  workspaceRole: WorkspaceRole;
  user: PlutomiId<IdPrefix.USER>;
  relatedTo: MembershipRelatedToArray;
  status: MembershipStatus;
};
