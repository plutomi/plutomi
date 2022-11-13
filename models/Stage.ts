import { Extends } from '../@types/extends';
import { IndexableProperties, IndexedTargetArrayItem } from '../@types/indexableProperties';
import { BaseEntity } from './Base';

export type StageTargetArray = Array<
  Omit<IndexedTargetArrayItem, 'property'> & {
    property: Extends<keyof typeof IndexableProperties, 'NextStage' | 'PreviousStage' | 'Opening'>;
  }
>;

export interface StageEntity extends BaseEntity {
  name: string;
  orgId: string; // Compound index with Id
  totalApplicants: number;
  totalQuestions: number;
  target: StageTargetArray;
}
