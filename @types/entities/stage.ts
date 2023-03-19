import { PlutomiId } from '../../utils';
import { IndexableType, IndexedTargetArray } from '../indexableProperties';
import { AllEntityNames } from './allEntityNames';
import { BaseEntity } from './baseEntity';

type StageTotals = {
  applicants: number;
  questions: number;
};

type StageTargetArray = [
  ...IndexedTargetArray<AllEntityNames.Stage>,
  // Get all stages in an application
  { id: PlutomiId<AllEntityNames.Application>; type: IndexableType.Stage },
  // Get all stages in an org
  {
    id: PlutomiId<AllEntityNames.Org>;
    type: IndexableType.Stage;
  },
  // Get all stages in a workspace
  {
    id: PlutomiId<AllEntityNames.Workspace>;
    type: IndexableType.Stage;
  },
];

export type Stage = BaseEntity<AllEntityNames.Stage> & {
  name: string;
  org: string;
  workspace: string;
  totals: StageTotals;
  target: StageTargetArray;
};