import { AllEntityNames } from './allEntityNames';
import { BaseEntity } from './baseEntity';

/**
 * Many to Many between stages and question item
 */

export interface StageQuestionItem extends BaseEntity<StageQuestionItemEntity> {
  orgId: string; // Compound index with ID
  target: [
    { id: PlutomiId<AllEntityNames.Stage>; type: AllEntityNames.Stage },
    { id: PlutomiId<AllEntityNames.QuestionItem>; type: AllEntityNames.QuestionItem },
  ];
}
