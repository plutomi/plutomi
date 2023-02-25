import { AllEntityNames, EntityKeys, PlutomiId, EntityIdPrefixes } from '../utils';

// These are properties, aside from each entity type, that can be indexed
export enum IndexableProperties {
  Entity = 'entity',
  Id = 'id',
  Email = 'email',
  OpeningState = 'openingState',
  /**
   * Generic across items that can be reordered
   */
  NextItem = 'nextItem',
  PreviousItem = 'previousItem',
}

export type AllIndexableProperties = IndexableProperties | typeof EntityIdPrefixes;

// ! First two entries are always the entity type and the raw ID
type EntityTargetArrayItem = {
  id: AllEntityNames;
  type: IndexableProperties.Entity;
};

type IdTargetArrayItem = {
  id: PlutomiId<AllEntityNames>;
  type: IndexableProperties.Id;
};

// These can be anything
type OtherTargetArrayItems = {
  id: PlutomiId<AllEntityNames> | string | boolean | number;
  type: AllIndexableProperties;
};

export type IndexedTargetArray<T extends AllEntityNames> = [
  { id: PlutomiId<T>; type: IndexableProperties.Entity },
  { id: PlutomiId<T>; type: IndexableProperties.Id },
  ...OtherTargetArrayItems[],
];
