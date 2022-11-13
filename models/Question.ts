import { IndexableProperties, IndexedTargetArrayItem } from '../@types/indexableProperties';
import { BaseEntity } from './Base';

export enum QuestionType {
  Text = 'Text',
  // TODO: More question types
}

export type QuestionTargetArray = Array<
  Omit<IndexedTargetArrayItem, 'property'> & {
    property: keyof typeof IndexableProperties;
  }
>;

export interface QuestionEntity extends BaseEntity {
  orgId: string; // Compound index with ID
  title: string;
  description: string;
  type: QuestionType;
  totalStages: number;
  target: QuestionTargetArray;
}
