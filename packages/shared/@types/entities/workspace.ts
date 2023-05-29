// import type { RelatedToType, RelatedToArray } from "../indexableProperties";
// import type { PlutomiId } from "../plutomiId";
// import type { IdPrefix } from "./idPrefix";
// import type { BaseEntity } from "./baseEntity";
// import type { OrgTotals } from "./org";

// type WorkspaceTotals = Omit<OrgTotals, "workspaces">;

// type WorkspaceRelatedToArray =
//   // Get all workspaces for an org
//   [
//     ...RelatedToArray<IdPrefix.Workspace>,
//     { id: PlutomiId<IdPrefix.Org>; type: RelatedToType.Workspace }
//   ];

// export type Workspace = BaseEntity<IdPrefix.Workspace> & {
//   name: string;
//   totals: WorkspaceTotals;
//   relatedTo: WorkspaceRelatedToArray;
// };
