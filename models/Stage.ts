import { IndexableProperties } from '../@types/indexableProperties';
import { BaseEntity } from './Base';

export type StageTargetArray = [
  { property: IndexableProperties.NextStage; value: string },
  { property: IndexableProperties.PreviousStage; value: string },
  { property: IndexableProperties.Opening; value: string },
];
export interface StageEntity extends BaseEntity {
  name: string;
  orgId: string; // Compound index with Id
  totalApplicants: number;
  totalQuestions: number;
  target: StageTargetArray;
}
