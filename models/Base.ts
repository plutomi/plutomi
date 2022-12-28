import { IndexedTargetArray } from '../@types/indexableProperties';
import { AllEntityNames, EntityPrefixes } from '../utils';

type PlutomiId = `${typeof EntityPrefixes[AllEntityNames]}${string}`;

export interface BaseEntity {
  _id: PlutomiId;
  createdAt: Date;
  updatedAt: Date;
  /**
   * Created with {@link generatePlutomiId}.
   */
  itemId: string;
  target: IndexedTargetArray;
}
