import { PlutomiId } from '../../utils';
import { IndexedTargetArray } from '../indexableProperties';
import { AllEntityNames } from './allEntityNames';

export interface BaseEntity<T extends typeof AllEntityNames> {
  _id: PlutomiId<T>;
  createdAt: Date;
  updatedAt: Date;
  entityType: T;
  target: IndexedTargetArray<T>;
}
