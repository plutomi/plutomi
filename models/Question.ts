import { IndexableProperties, IndexedTargetArrayItem } from '../@types/indexableProperties';
import { BaseEntity } from './Base';
import { Extends } from '../@types/extends';

export enum QuestionType {
  Text = 'Text',
  // TODO: More question types
}

export type QuestionTargetArray = [];
export interface QuestionEntity extends BaseEntity {
  orgId: string; // Compound index with ID
  title: string;
  description: string;
  type: QuestionType;
  totalStages: number;
  target: QuestionTargetArray;
}
