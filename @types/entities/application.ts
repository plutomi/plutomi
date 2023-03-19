import { AllEntityNames } from './allEntityNames';
import { PlutomiId } from '../../utils';
import { IndexableType, IndexedTargetArray } from '../indexableProperties';
import { BaseEntity } from './baseEntity';

type ApplicationTotals = {
  applicants: number;
  stages: number;
};

type ApplicationTargetArray = [
  ...IndexedTargetArray<AllEntityNames.Application>,
  // Get all applications for an org
  { id: PlutomiId<AllEntityNames.Org>; type: IndexableType.Org },
  // Get all applications for a workspace
  { id: PlutomiId<AllEntityNames.Workspace>; type: IndexableType.Workspace },
];

export type Application = BaseEntity<AllEntityNames.Application> & {
  name: string;
  org: string;
  workspace: string;
  totals: ApplicationTotals;
  target: ApplicationTargetArray;
};
