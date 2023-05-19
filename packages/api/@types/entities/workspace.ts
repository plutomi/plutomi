import type { IndexableType, IndexedTargetArray } from "../indexableProperties";
import type { PlutomiId } from "../plutomiId";
import type { AllEntityNames } from "./allEntityNames";
import type { BaseEntity } from "./baseEntity";
import type { OrgTotals } from "./org";

type WorkspaceTotals = Omit<OrgTotals, "workspaces">;

type WorkspaceTargetArray =
  // Get all workspaces for an org
  [
    ...IndexedTargetArray<AllEntityNames.Workspace>,
    { id: PlutomiId<AllEntityNames.Org>; type: IndexableType.Workspace }
  ];

export type Workspace = BaseEntity<AllEntityNames.Workspace> & {
  name: string;
  totals: WorkspaceTotals;
  target: WorkspaceTargetArray;
};
