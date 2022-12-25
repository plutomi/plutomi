import { IndexedTargetArray } from '../@types/indexableProperties';
export interface BaseEntity {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  /**
   * Created with {@link generatePlutomiId}.
   */
  uniqueId: string;
  target: IndexedTargetArray;
}
