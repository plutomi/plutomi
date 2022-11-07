import { IndexableProperties, IndexedTargetArrayItem } from '../@types/indexableProperties';
import { BaseEntity } from './Base';
import { Extends } from '../@types/extends';

/**
 * Many to Many between stages and question item
 */

export type StageQuestionItemTargetArray = Array<
  Omit<IndexedTargetArrayItem, 'property'> & {
    property: Extends<
      keyof typeof IndexableProperties,
      'Org' | 'PreviousQuestion' | 'NextQuestion' | 'Stage' | 'Question'
    >;
  }
>;

export interface StageQuestionItemEntity extends BaseEntity {
  target: StageQuestionItemTargetArray;
}
