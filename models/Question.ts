import { IndexableProperties, IndexedTargetArrayItem } from '../@types/indexableProperties';
import { BaseEntity } from './Base';
import { Extends } from '../@types/extends';

export enum QuestionType {
  Text = 'Text',
  // TODO: More question types
}
export type QuestionTargetArray = Array<
  Omit<IndexedTargetArrayItem, 'property'> & {
    property: Extends<keyof typeof IndexableProperties, 'Org'>;
  }
>;

export interface QuestionEntity extends BaseEntity {
  title: string;
  description: string;
  type: QuestionType;
  totalStages: number;
  target: QuestionTargetArray;
}
