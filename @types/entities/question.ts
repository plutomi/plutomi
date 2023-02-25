import { AllEntityNames } from '../allEntityNames';
import { BaseEntity } from './baseEntity';

export enum QuestionType {
  Text = 'Text',
  // TODO: More question types
}

interface QuestionTotals {
  stages: number;
}

export interface QuestionEntity extends BaseEntity<AllEntityNames.Question> {
  title: string;
  description: string;
  orgId: string;
  type: QuestionType;
  totalStages: number;
}
