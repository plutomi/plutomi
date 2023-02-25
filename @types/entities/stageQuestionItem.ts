import { IndexableProperties, IndexedTargetArrayItem } from '../@types/indexableProperties';
import { BaseEntity } from './baseEntity';
import { Extends } from '../@types/extends';

/**
 * Many to Many between stages and question item
 */

export type StageQuestionItemTargetArray = Array<
  Omit<IndexedTargetArrayItem, 'property'> & {
    property: Extends<
      keyof typeof IndexableProperties,
      'PreviousQuestion' | 'NextQuestion' | 'Stage' | 'Question'
    >;
  }
>;

export interface StageQuestionItemEntity extends BaseEntity {
  orgId: string; // Compound index with ID
  target: StageQuestionItemTargetArray;
}
