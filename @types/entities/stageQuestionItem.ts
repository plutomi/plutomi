import { PlutomiId } from '../../utils';
import { IndexableType, IndexedTargetArray } from '../indexableProperties';
import { AllEntityNames } from './allEntityNames';
import { BaseEntity } from './baseEntity';

type Entity = AllEntityNames.StageQuestionItem;

type StageQuestionItemTargetArray = IndexedTargetArray<Entity> &
  [
    { id: PlutomiId<AllEntityNames.Stage>; type: IndexableType.Id },
    { id: PlutomiId<AllEntityNames.Question>; type: IndexableType.Id },
  ];

export type StageQuestionItem = BaseEntity<Entity> & {
  org: string;
  target: StageQuestionItemTargetArray;
};
