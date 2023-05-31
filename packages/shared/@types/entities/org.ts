import type { RelatedToArray } from "../indexableProperties";
import type { IdPrefix } from "./idPrefix";
import type { BaseEntity } from "./baseEntity";
import type { PlutomiId } from "../plutomiId";

/**
 * An org is the parent of all workspaces and users, and therefore the parent of all memberships.
 */

type MembershipRelatedToArray = [...RelatedToArray<IdPrefix.ORG>];

export type Org = BaseEntity<IdPrefix.ORG> & {
  createdBy: PlutomiId<IdPrefix.USER>;
  name: string;
  publicOrgId: string; // ^[a-z0-9\-]*$ -> ORG#1234
  relatedTo: MembershipRelatedToArray;
};
