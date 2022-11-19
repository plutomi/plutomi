export type IndexTypes =
  | 'self' // Self referential ID
  | 'user'
  | 'userLoginLink'
  | 'email'
  | 'createdAt'
  | 'updatedAt'
  | 'org'
  | 'opening'
  | 'openingState'
  | 'stage'
  | 'previousStage'
  | 'nextStage'
  | 'question'
  | 'previousQuestion'
  | 'nextQuestion'
  | 'applicant'
  | 'webhook'
  | 'applicant';

export interface IndexedTargetArrayItem {
  id: string | null;
  type: IndexTypes;
}
export type IndexedTargetArray = Array<IndexedTargetArrayItem>;
