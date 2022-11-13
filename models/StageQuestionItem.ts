import { IndexableProperties, IndexedTargetArrayItem } from '../@types/indexableProperties';
import { BaseEntity } from './Base';
import { Extends } from '../@types/extends';

/**
 * Many to Many between stages and question item
 */

export type StageQuestionItemTargetArray = [
  {
    property: IndexableProperties.PreviousQuestion;
    value: string;
  },
  {
    property: IndexableProperties.NextQuestion;
    value: string;
  },
  {
    property: IndexableProperties.Stage;
    value: string;
  },
  {
    property: IndexableProperties.Question;
    value: string;
  },
];
export interface StageQuestionItemEntity extends BaseEntity {
  orgId: string; // Compound index with ID
  target: StageQuestionItemTargetArray;
}
