import { PlutomiId } from '../utils';
import { AllEntityNames } from './entities';

// These are properties, aside from each entity type, that can be indexed
export enum IndexableType {
  /**
   * All entities - ! TODO: Please TS gods add a way to extract this from AllEntityName
   */
  User = 'user',
  Org = 'org',
  Application = 'application',
  Invite = 'invite',
  Question = 'question',
  Stage = 'stage',

  /**
   * Misc
   */
  Entity = 'entity',
  Id = 'id',
  Email = 'email',
  ApplicationState = 'applicationState',
  /**
   * Generic across items that can be reordered
   */
  NextItem = 'nextItem',
  PreviousItem = 'previousItem',
}

// These can be anything
type OtherTargetArrayItems = {
  id: PlutomiId<AllEntityNames> | string | boolean | number;
  type: IndexableType;
};

export type IndexedTargetArray<T extends AllEntityNames> = [
  // These two will always be the first two
  { id: T; type: IndexableType.Entity },
  { id: PlutomiId<T>; type: IndexableType.Id },
  ...OtherTargetArrayItems[],
];
