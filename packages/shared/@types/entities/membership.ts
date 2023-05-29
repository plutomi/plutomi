// import type { RelatedToType, RelatedToArray } from "../indexableProperties";
// import type { PlutomiId } from "../plutomiId";
// import type { IdPrefix } from "./idPrefix";
// import type { BaseEntity } from "./baseEntity";

// /**
//  * Memberships are the link between users and workspaces. A user can be in many workspaces, and a workspace can have many users.
//  * An example would be a recruiting firm that creates a workspace per client.
//  * Each client would have a workspace, and each recruiter would be a user in that workspace.
//  * Not all recruiters need access to every workspace, even though they are all part of the same organization.
//  *
//  * For more info, see this post: https://blitzjs.com/docs/multitenancy
//  */

// type MembershipRelatedToArray = [
//   ...RelatedToArray<IdPrefix.Membership>,
//   // Get all members of an org
//   { id: PlutomiId<IdPrefix.Org>; type: RelatedToType.Membership },
//   // Get all memberships for a user and with it, all the workspaces they are in
//   { id: PlutomiId<IdPrefix.User>; type: RelatedToType.Membership },
//   // Get all memberships for a workspace and with it, all the users in that workspace
//   { id: PlutomiId<IdPrefix.Workspace>; type: RelatedToType.Membership }
// ];

// export type Membership = BaseEntity<IdPrefix.Membership> & {
//   org: string;
//   relatedTo: MembershipRelatedToArray;
// };
