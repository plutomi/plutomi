import { PlutomiId } from '../../utils';
import { IndexableType, IndexedTargetArray } from '../indexableProperties';
import { AllEntityNames } from './allEntityNames';
import { BaseEntity } from './baseEntity';

export type QuestionTotals = {
  stages: number;
};

export enum QuestionType {
  Text = 'Text',
  // TODO: More question types
}
type Entity = AllEntityNames.Question;
type QuestionTargetArray = [
  ...IndexedTargetArray<Entity>,
  // Get questions in an org
  { id: PlutomiId<AllEntityNames.Org>; type: IndexableType.Question },
  // Get questions in a workspace
  { id: PlutomiId<AllEntityNames.Workspace>; type: IndexableType.Question },
];

export type Question = BaseEntity<Entity> & {
  title: string;
  description: string;
  org: string;
  workspace: string;
  totals: QuestionTotals;
  target: QuestionTargetArray;
};
