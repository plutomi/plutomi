import type { IdPrefix } from "./entities";
import type { PlutomiId } from "./plutomiId";

// These are properties, aside from each entity type, that can be indexed
export enum RelatedToType {
  /**
   * All entities. Note: When doing aggregations, these will be keys in the parent object.
   * ie: /applicants/:id will have the applicant as the parent and the notes & files as keys in the parent object
   */

  USERS = "users",
  WAIT_LIST_USERS = "waitListUsers",
  TOTPS = "totps",
  SESSIONS = "sessions",
  SELF = "self",
  NOTES = "notes",
  FILES = "files",
  MEMBERSHIPS = "memberships",
  INVITES = "invites",
  TASKS = "tasks",
  ACTIVITY = "activity"
}

// These can be anything
type OtherRelatedToArrayItems = {
  id: PlutomiId<IdPrefix> | string | boolean | number;
  type: RelatedToType;
};

/**
 *
 * When we query for entities, we ideally want to get all the related data in 1 query. To do that, we use the `relatedTo` array.
 * An example of an endpoint that would use this is /applicants/:id where we would want to get an applicant and all of their notes & files.
 *
 * There is a util method called getJoinedAggregation that will do this for us. Provide it with the entity and the related entities you want to retrieve.
 *
 * The util method will return an entity with all related items that you provide, and it will be undefined if the root item does not exist.
 *
 * For more fine-grained endpoints like /applicants/:id/notes, we can use the following query and retrieve those items directly.
 * You *must* include `$elemMatch` to use the index.
 *
 * { relatedTo: { $elemMatch: { id: 'applicant_3810', type: 'notes' } } }
 *
 * And to retrieve a specific item, we can use the _id field directly.
 *
 * To see this indexed multi-key array in action, watch this video:
 *
 * @link https://www.youtube.com/watch?v=eEENrNKxCdw&t=1263s
 *
 */
export type RelatedToArray<T extends IdPrefix> = [
  // These two will always be the first two items
  { id: PlutomiId<T>; type: RelatedToType.SELF },
  ...OtherRelatedToArrayItems[]
];
