import type { AllEntityNames } from "./entities/allEntityNames";
import type { PlutomiId } from "./plutomiId";

// These are properties, aside from each entity type, that can be indexed
export enum IndexableType {
  /**
   * All entities -
   */

  // ! TODO: Please TS gods add a way to extract this from AllEntityName.
  // I reaaaaaaaaaaaaally don't like how we have duplicate data here
  User = "user",
  Org = "org",
  Application = "application",
  Invite = "invite",
  Question = "question",
  Stage = "stage",
  StageQuestionItem = "stageQuestionItem",
  Workspace = "workspace",
  Membership = "membership",
  /**
   * Misc
   */
  Entity = "entity",
  Id = "id",
  Email = "email",
  ApplicationState = "applicationState",
  /**
   * Generic across items that can be reordered
   */
  NextItem = "nextItem",
  PreviousItem = "previousItem"
}

// These can be anything
type OtherTargetArrayItems = {
  id: PlutomiId<AllEntityNames> | string | boolean | number;
  type: IndexableType;
};

/**
 * All entities have a target array that is used for indexing. The first two properties
 * are always the entity type and the entity id. The rest are up to the entity and
 * optimized for the most frequent usecases for that entity.
 * @example`Stage` entity:
 *
 * [{ id: AllEntityNames.Stage type: IndexableType.Entity }, { id: PlutomiId<AllEntityNames.Stage>, type: IndexableType.Id }]

 * The first item allows retrieving all stages, application wide.
 * 
 * The second allows retrieving a stage by its id, you can also use _id for this.
 * 
 * The second index plays a crucial role for when other entities relate to this stage.
 * Because the id will be the same (indexing on a common attribute), and the 'type' will be different,
 * we can query for this stage by id, and then filter by the type to get all entities that relate to this stage in 1 query.
 * To see this in action, watch this video:
 * 
 * @link https://www.youtube.com/watch?v=eEENrNKxCdw&t=1263s
 * 
 */
export type IndexedTargetArray<T extends AllEntityNames> = [
  // These two will always be the first two
  { id: T; type: IndexableType.Entity },
  { id: PlutomiId<T>; type: IndexableType.Id },
  ...OtherTargetArrayItems[]
];
