import type { RelatedToArray } from "../indexableProperties";
import type { IdPrefix } from "./idPrefix";
import type { BaseEntity } from "./baseEntity";
import type { PlutomiId } from "../plutomiId";

/**
 * An org is the parent of all workspaces and users, and therefore the parent of all memberships.
 */

type MembershipRelatedToArray = [...RelatedToArray<IdPrefix.ORG>];

export type Org = BaseEntity<IdPrefix.ORG> & {
  created_by: PlutomiId<IdPrefix.USER>;
  name: string;
  related_to: MembershipRelatedToArray;
};