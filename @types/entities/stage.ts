import { PlutomiId } from '../../utils';
import { IndexableType, IndexedTargetArray } from '../indexableProperties';
import { AllEntityNames } from './allEntityNames';
import { BaseEntity } from './baseEntity';
import { StageTotals } from './totalsCount';

type Entity = AllEntityNames.Stage;

type StageTargetArray = IndexedTargetArray<Entity> &
  // Get all stages in an application
  [
    { id: PlutomiId<AllEntityNames.Application>; type: IndexableType.Stage },
    // Get all stages in an org
    {
      id: PlutomiId<AllEntityNames.Org>;
      type: IndexableType.Stage;
    },
  ];

export type StageEntity = BaseEntity<Entity> & {
  name: string;
  org: string;
  totals: StageTotals;
  target: StageTargetArray;
};
