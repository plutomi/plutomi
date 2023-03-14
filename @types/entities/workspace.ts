import { PlutomiId } from '../../utils';
import { IndexableType, IndexedTargetArray } from '../indexableProperties';
import { AllEntityNames } from './allEntityNames';
import { BaseEntity } from './baseEntity';
import { OrgTotals } from './org';

type WorkspaceTotals = Omit<OrgTotals, 'workspaces'>;

type Entity = AllEntityNames.Workspace;

type WorkspaceTargetArray =
  // Get all workspaces for an org
  [...IndexedTargetArray<Entity>, { id: PlutomiId<Entity>; type: IndexableType.Workspace }];

export type Workspace = BaseEntity<Entity> & {
  name: string;
  totals: WorkspaceTotals;
  target: WorkspaceTargetArray;
};
