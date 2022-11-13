import { IndexableProperties, IndexedTargetArrayItem } from '../@types/indexableProperties';
import { BaseEntity } from './Base';
import { Extends } from '../@types/extends';

export type OpeningTargetArray = Array<
  Omit<IndexedTargetArrayItem, 'property'> & {
    property: Extends<keyof typeof IndexableProperties, 'OpeningState'>;
  }
>;

export interface OpeningEntity extends BaseEntity {
  name: string;
  totalApplicants: number;
  totalStages: number;
  target: OpeningTargetArray;
}
