import type { AllEntityNames } from "./entities";
import type { PlutomiId } from "./plutomiId";

// These are properties, aside from each entity type, that can be indexed
export enum RelatedToType {
  /**
   * All entities
   */

  USERS = "users",
  WAIT_LIST_USERS = "waitListUsers",
  TOTPS = "totps",
  SESSIONS = "sessions",
  SELF = "self",
  NOTES = "notes",
  FILES = "files"
}

// These can be anything
type OtherRelatedToArrayItems = {
  id: PlutomiId<AllEntityNames> | string | boolean | number;
  type: RelatedToType;
};

/**
 *
 * When we query for entities, we ideally want to get all the related data in 1 query. To do that, we use the `relatedTo` array.
 * An example of an endpoint that would use this is /applicants/:id where we would want to get an applicant and all of their notes & files.
 *
 * There is a util method called getJoinedAggregation that will do this for us. Provide it with the entity and the related entities you want to retrieve.
 *
 * ! If the `_id` field of the returned document is "entityType", then the root document does not exist. Make sure to handle that case.
 *
 * For more fine-grained endpoints like /applicants/:id/notes, we can use the following query and retrieve those items directly.
 * You *must* include `$elemMatch` to use the index.
 *
 * { relatedTo: { $elemMatch: { id: 'applicant_3810', type: 'notes' } } }
 *
 * To see this indexed multi-key array in action, watch this video:
 *
 * @link https://www.youtube.com/watch?v=eEENrNKxCdw&t=1263s
 *
 */
export type RelatedToArray<T extends AllEntityNames> = [
  // These two will always be the first two items
  { id: PlutomiId<T>; type: RelatedToType.SELF },
  ...OtherRelatedToArrayItems[]
];
