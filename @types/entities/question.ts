import { PlutomiId } from '../../utils';
import { IndexableType, IndexedTargetArray } from '../indexableProperties';
import { AllEntityNames } from './allEntityNames';
import { BaseEntity } from './baseEntity';
import { QuestionTotals } from './totalsCount';

export enum QuestionType {
  Text = 'Text',
  // TODO: More question types
}
type Entity = AllEntityNames.Question;
type QuestionTargetArray = IndexedTargetArray<Entity> &
  // Get questions in an org
  [{ id: PlutomiId<AllEntityNames.Org>; type: IndexableType.Question }];

export type QuestionEntity = BaseEntity<Entity> & {
  title: string;
  description: string;
  org: string;
  type: QuestionType;
  totals: QuestionTotals;
  target: QuestionTargetArray;
};
