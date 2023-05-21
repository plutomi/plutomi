import type { AllEntityNames } from "./entities";
import type { PlutomiId } from "./plutomiId";

// These are properties, aside from each entity type, that can be indexed
export enum RelatedToType {
  /**
   * All entities -
   */

  // ! TODO: Please TS gods add a way to extract this from AllEntityName.
  // I really don't like how we have duplicate data here
  USER = "USER",
  TOTP_CODE = "TOTP_CODE",
  // Org = "org",
  // Application = "application",
  // Invite = "invite",
  // Question = "question",
  // Stage = "stage",
  // StageQuestionItem = "stageQuestionItem",
  // Workspace = "workspace",
  // Membership = "membership",
  /**
   * Misc
   */
  ENTITY = "ENTITY",
  ID = "ID",
  EMAIL = "EMAIL"
  // ApplicationState = "applicationState",
  /**
   * Generic across items that can be reordered
   */
  // NextItem = "nextItem",
  // PreviousItem = "previousItem"
}

// These can be anything
type OtherRelatedToArrayItems = {
  id: PlutomiId<AllEntityNames> | string | boolean | number;
  type: RelatedToType;
};

/**
 * All entities have a target array that is used for indexing. The first two properties
 * are always the entity type and the entity id. The rest are up to the entity and
 * optimized for the most frequent use cases for that entity.
 * @example`Stage` entity:
 *
 * [{ id: AllEntityNames.Stage type: RelatedToType.Entity }, { id: PlutomiId<AllEntityNames.Stage>, type: RelatedToType.Id }]

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
export type RelatedToArray<T extends AllEntityNames> = [
  // These two will always be the first two items
  { id: T; type: RelatedToType.ENTITY },
  { id: PlutomiId<T>; type: RelatedToType.ID },
  ...OtherRelatedToArrayItems[]
];
