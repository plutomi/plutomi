import type { RelatedToArray } from "../indexableProperties";
import type { IdPrefix } from "./idPrefix";
import type { BaseEntity } from "./baseEntity";

/**
 * An org is the parent of all workspaces and users, and therefore the parent of all memberships.
 */

type MembershipRelatedToArray = [
  ...RelatedToArray<IdPrefix.ORG>
  // Get all members of an org
  //   { id: PlutomiId<IdPrefix.ORG>; type: RelatedToType.MEMBERSHIPS }
];

export type Org = BaseEntity<IdPrefix.ORG> & {
  createdBy: string;
  displayName: string;
  relatedTo: MembershipRelatedToArray;
};
