import { PlutomiId } from '../../utils';
import { IndexedTargetArray } from '../indexableProperties';
import { AllEntityNames } from './allEntityNames';
import { BaseEntity } from './baseEntity';
import { StageTotals } from './totalsCount';

type Entity = AllEntityNames.Stage;

type StageTargetArray = IndexedTargetArray<Entity> &
  [{ id: PlutomiId<AllEntityNames.Application>; type: AllEntityNames.Stage }];

export type StageEntity = BaseEntity<Entity> & {
  name: string;
  org: string;
  totals: StageTotals;
  target: StageTargetArray;
};
