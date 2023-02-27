import { PlutomiId } from '../utils';
import { AllEntityNames } from './entities';

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

// These can be anything
type OtherTargetArrayItems = {
  id: PlutomiId<AllEntityNames> | string | boolean | number;
  type: IndexableProperties;
};

export type IndexedTargetArray<T extends AllEntityNames> = [
  // These two will always be the first two
  { id: T; type: IndexableProperties.Entity },
  { id: PlutomiId<T>; type: IndexableProperties.Id },
  ...OtherTargetArrayItems[],
];
