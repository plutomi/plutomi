export enum AllEntities {
  User = 'User',
  Org = 'Org',
  Opening = 'Opening',
  Stage = 'Stage',
  Question = 'Question',
  Webhook = 'Webhook',
  Applicant = 'Applicant',
  LoginLink = 'LoginLink',
}

// Note: These are properties inside of the above top level entities
export enum IndexableProperties {
  CreatedAt = 'CreatedAt',
  UpdatedAt = 'UpdatedAt',
  Email = 'Email',
  OpeningState = 'OpeningState',
  NextStage = 'NextStage',
  PreviousStage = 'PreviousStage',
  NextQuestion = 'NextQuestion',
  PreviousQuestion = 'PreviousQuestion',
}

export interface SelfTargetArrayItem {
  id: AllEntities;
  type: 'entityType';
}

export interface IdTargetArrayItem {
  id: string;
  type: 'id';
}

export interface IndexedTargetArrayItem {
  id: string | null;
  type: IndexableProperties | AllEntities;
}

/**
 * Must include two objects:
 * 1. The entity of the item
 * 2. The ID of the item
 */
export type IndexedTargetArray = [
  SelfTargetArrayItem,
  IdTargetArrayItem,
  ...IndexedTargetArrayItem[],
];
