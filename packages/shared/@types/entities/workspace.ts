// import type { RelatedToType, RelatedToArray } from "../indexableProperties";
// import type { PlutomiId } from "../plutomiId";
// import type { AllEntityNames } from "./allEntityNames";
// import type { BaseEntity } from "./baseEntity";
// import type { OrgTotals } from "./org";

// type WorkspaceTotals = Omit<OrgTotals, "workspaces">;

// type WorkspaceRelatedToArray =
//   // Get all workspaces for an org
//   [
//     ...RelatedToArray<AllEntityNames.Workspace>,
//     { id: PlutomiId<AllEntityNames.Org>; type: RelatedToType.Workspace }
//   ];

// export type Workspace = BaseEntity<AllEntityNames.Workspace> & {
//   name: string;
//   totals: WorkspaceTotals;
//   relatedTo: WorkspaceRelatedToArray;
// };
