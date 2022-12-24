import { AllEntities } from '../utils';

// Note: These are properties inside of the above top level entities
export enum IndexableProperties {
  Entity = 'Entity',
  User = 'User',
  Id = 'Id',
  Email = 'Email',
  OpeningState = 'OpeningState',
  NextStage = 'NextStage',
  PreviousStage = 'PreviousStage',
  NextQuestion = 'NextQuestion',
  PreviousQuestion = 'PreviousQuestion',
}

export interface EntityTargetArrayItem {
  id: AllEntities;
  type: IndexableProperties.Entity;
}

export interface IdTargetArrayItem {
  id: string;
  /**
   * Raw prefixed ID
   */
  type: IndexableProperties.Id;
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
  EntityTargetArrayItem,
  IdTargetArrayItem, // "raw" id
  ...IndexedTargetArrayItem[],
];
