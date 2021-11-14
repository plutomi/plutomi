import { EntityTypes } from "../../../types/additional";

interface StageRuleDynamoEntry {
  /**
   * Primary key of the stage rule, requires `orgId`, `openingId`, and `stageId`
   */
  PK: `ORG#${string}#OPENING#${string}#STAGE#${string}`;
  /**
   * Sort key which is the {@link EntityTypes.STAGE_RULE}#`stageId`
   */
  SK: `${EntityTypes.STAGE_RULE}#${string}`;
  /**
   * The entity of the stage rule
   */
  entityType: EntityTypes.STAGE_RULE;
  /**
   * ISO string timestamp of when the rule was created
   */
  createdAt: string;
  /**
   * @todo validation type, string for now // TODO
   */
  validation: string; // TODO add validation TYPES
  /**
   * GSI Primary key to return all rules for all stages? for some reason. TBD // TODO
   */
  GSI1PK: `ORG#${string}#RULES#STAGES`;
  /**
   * Sort key to sort by `stageId`
   */
  GSI1SK: string; // TODO filter by opening by stage?
}

interface CreateStageRuleInput
  extends Pick<StageRuleDynamoEntry, "orgId" | "openingId" | "validation"> {
  stageId: string;
}
type CreateStageRuleOutput = StageRuleDynamoEntry;
