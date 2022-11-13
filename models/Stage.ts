import { IndexableProperties, IndexedTargetArrayItem } from '../@types/indexableProperties';
import { BaseEntity } from './Base';
import { Extends } from '../@types/extends';

export type StageTargetArray = Array<
  Omit<IndexedTargetArrayItem, 'property'> & {
    property: Extends<keyof typeof IndexableProperties, 'NextStage' | 'PreviousStage' | 'Opening'>;
  }
>;

export interface StageEntity extends BaseEntity {
  name: string;
  totalApplicants: number;
  totalQuestions: number;
  target: StageTargetArray;
}
