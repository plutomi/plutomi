import type { RelatedToType, RelatedToArray } from "../indexableProperties";
import type { PlutomiId } from "../plutomiId";
import type { IdPrefix } from "./idPrefix";
import type { BaseEntity } from "./baseEntity";

type WorkspaceRelatedToArray = [
  ...RelatedToArray<IdPrefix.WORKSPACE>,
  // Get all workspaces for an org
  { id: PlutomiId<IdPrefix.ORG>; type: RelatedToType.WORKSPACES }
];

export type Workspace = BaseEntity<IdPrefix.WORKSPACE> & {
  name: string;
  relatedTo: WorkspaceRelatedToArray;
};
