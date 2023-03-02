import { AllEntityNames } from './allEntityNames';
import { BaseEntity } from './baseEntity';
import { QuestionTotals } from './totalsCount';

export enum QuestionType {
  Text = 'Text',
  // TODO: More question types
}

export type QuestionEntity = BaseEntity<AllEntityNames.Question> & {
  title: string;
  description: string;
  org: string;
  type: QuestionType;
  totals: QuestionTotals;
};
