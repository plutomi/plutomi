import { EntityTypes } from "../../../types/additional";

interface StagesDynamoEntry {
  /**
   * Primary key for creating a stage - takes `orgId` and `stageId`
   */
  PK: `ORG#${string}#STAGE#${string}`;
  /**
   * Sort key for a stage, it's just the {@link EntityTypes.STAGE}
   */
  SK: EntityTypes.STAGE;
  /**
   * The stage entity type {@link EntityTypes.STAGE}
   */
  entityType: EntityTypes.STAGE;
  /**
   * ISO timestamp of when the stage was created
   */
  createdAt: string;
  /**
   * The order of the questions for the stage
   */
  questionOrder: string[];
  /**
   * The Id for the stage
   */
  stageId: stageId;
  /**
   * How many applicants are in the stage, updated in a transaction so it's always accurate
   */
  totalApplicants: number;
  /**
   * The opening this stage belongs to
   */
  openingId: string;
  /**
   * The primary key to get all stages in an opening. Requires `orgId` and `openingId`
   */
  GSI1PK: `ORG#${orgId}#OPENING#${openingId}#STAGES`;
  /**
   * The stage name
   */
  GSI1SK: GSI1SK;
}

type CreateStageInput = Pick<
  StagesDynamoEntry,
  "orgId" | "GSI1SK" | "openingId"
>;

type DeleteStageInput = Pick<StagesDynamoEntry, "orgId" | "stageId">;
type GetStageByIdInput = Pick<StagesDynamoEntry, "orgId" | "stageId">;
type GetStageByIdOutput = StagesDynamoEntry;
type GetAllApplicantsInStageInput = Pick<
  StagesDynamoEntry,
  "orgId" | "stageId"
>;
type GetAllApplicantsInStageOutput = ApplicantDynamoEntry[];

