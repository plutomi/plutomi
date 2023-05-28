import type { AllEntityNames } from "./entities";
import type { PlutomiId } from "./plutomiId";

// These are properties, aside from each entity type, that can be indexed
export enum RelatedToType {
  /**
   * All entities
   */

  // ! TODO: Please TS gods add a way to extract this from AllEntityName.
  USER = "USER",
  WAIT_LIST_USER = "WAIT_LIST_USER",
  TOTP = "TOTP",
  SESSION = "SESSION",
  SELF = "SELF"
}

// These can be anything
type OtherRelatedToArrayItems = {
  id: PlutomiId<AllEntityNames> | string | boolean | number;
  type: RelatedToType;
};

/**
 * In pretty much every case, when a request comes through, want to check if that entity exists. To do that, we query using the _id field.
 * All entities also have a `relatedTo` array for checking the things they are related to. After the check above is complete, we usually want to pull
 * the related data afterwards. You can do that like this: 
 * 
 * {$or: [ { relatedTo: { $elemMatch: { id: 'user_3810', type: 'files' } }},{ relatedTo: { $elemMatch: { id: 'user_3810', type: 'notes' } }}]}
 * 
 * The second index plays a crucial role for when other entities relate to this stage.
 * Because the id will be the same (indexing on a common attribute), and the 'type' will be different,
 * we can query for this stage by id, and then filter by the type to get all entities that relate to this stage in 1 query.
 * To see this in action, watch this video:
 * 
 * @link https://www.youtube.com/watch?v=eEENrNKxCdw&t=1263s
 * 
 */
export type RelatedToArray<T extends AllEntityNames> = [
  // These two will always be the first two items
  { id: PlutomiId<T>; type: RelatedToType.SELF },
  ...OtherRelatedToArrayItems[]
];
