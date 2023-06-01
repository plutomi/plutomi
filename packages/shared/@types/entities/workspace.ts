import type { RelatedToType, RelatedToArray } from "../indexableProperties";
import type { PlutomiId } from "../plutomiId";
import type { IdPrefix } from "./idPrefix";
import type { BaseEntity } from "./baseEntity";

type WorkspaceRelatedToArray = [
  ...RelatedToArray<IdPrefix.WORKSPACE>,
  // Get all workspaces for an org
  { id: PlutomiId<IdPrefix.ORG>; type: RelatedToType.WORKSPACES }
  // { id: PlutomiId<IdPrefix.USER>; type: RelatedToType }
];

export type Workspace = BaseEntity<IdPrefix.WORKSPACE> & {
  name: string;
  isDefault: boolean;
  relatedTo: WorkspaceRelatedToArray;
  org: PlutomiId<IdPrefix.ORG>;
  createdBy: PlutomiId<IdPrefix.USER>;
};
