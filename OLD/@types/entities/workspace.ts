import { PlutomiId } from '../../OLD/utils';
import { IndexableType, IndexedTargetArray } from '../indexableProperties';
import { AllEntityNames } from './allEntityNames';
import { BaseEntity } from './baseEntity';
import { OrgTotals } from './org';

type WorkspaceTotals = Omit<OrgTotals, 'workspaces'>;

type WorkspaceTargetArray =
  // Get all workspaces for an org
  [
    ...IndexedTargetArray<AllEntityNames.Workspace>,
    { id: PlutomiId<AllEntityNames.Org>; type: IndexableType.Workspace },
  ];

export type Workspace = BaseEntity<AllEntityNames.Workspace> & {
  name: string;
  totals: WorkspaceTotals;
  target: WorkspaceTargetArray;
};
