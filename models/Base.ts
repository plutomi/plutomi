import { IndexedTargetArray } from '../@types/indexableProperties';
import { AllEntityNames, PlutomiId } from '../utils';

export interface BaseEntity<T extends AllEntityNames> {
  _id: PlutomiId<T>;
  createdAt: Date;
  updatedAt: Date;
  target: IndexedTargetArray<T>;
}
