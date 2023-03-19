import { PlutomiId } from '../../utils';
import { IndexableType, IndexedTargetArray } from '../indexableProperties';
import { AllEntityNames } from './allEntityNames';
import { BaseEntity } from './baseEntity';

// TODO add the explainer here
type StageQuestionItemTargetArray = [
  ...IndexedTargetArray<AllEntityNames.StageQuestionItem>,
  { id: PlutomiId<AllEntityNames.Stage>; type: IndexableType.Id },
  { id: PlutomiId<AllEntityNames.Question>; type: IndexableType.Id },
];

export type StageQuestionItem = BaseEntity<AllEntityNames.StageQuestionItem> & {
  org: string;
  workspace: string;
  target: StageQuestionItemTargetArray;
};
