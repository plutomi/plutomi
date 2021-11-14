import { ENTITY_TYPES } from "./defaults";

export interface QuestionsDynamoEntry {
  /**
   * The primary key for the question. Variables are `orgId` and `questionId`
   */
  PK: `ORG#${string}#STAGE_QUESTION#${string}`;
  /**
   * Sort key for the question. In this case, it's just the {@link ENTITY_TYPES.STAGE_QUESTION}
   */
  SK: ENTITY_TYPES.STAGE_QUESTION;
  /**
   * The ID of the question
   */
  questionId: string;
  /**
   * The description of the question
   * @default '' - Empty string
   */
  questionDescription: string;
  /**
   * Which org does this question belong to
   */
  orgId: string;

  /**
   * The entityType {@link ENTITY_TYPES.STAGE_QUESTION}
   */
  entityType: ENTITY_TYPES.STAGE_QUESTION;
  /**
   * ISO timestamp of when this question was created
   */
  createdAt: string;

  /**
   * Which stage does this question belong to
   */
  stageId: string;

  /**
   * The primary key for the questios GSI1, params are `orgId` and `stageId`
   */
  GSI1PK: `ORG#${string}#STAGE#${string}#QUESTIONS`;

  /**
   * The question title
   */
  GSI1SK: string;

  /**
   * The question description
   */
  questionDescription: string;
}

type CreateQuestionInput = Pick<
  QuestionsDynamoEntry,
  "orgId" | "stageId" | "GSI1SK" | "questionDescription"
>;

type orgIdAndQuestionId = "orgId" | "questionId";

type DeleteQuestionInput = Pick<QuestionsDynamoEntry, orgIdAndQuestionId>;

type GetQuestionInput = Pick<QuestionsDynamoEntry, orgIdAndQuestionId>;
type GetQuestionOutput = QuestionsDynamoEntry;

type GetAllQuestionsInStageInput = Pick<
  QuestionsDynamoEntry,
  "orgId" | "stageId"
>;

interface UpdateQuestionInput
  extends Pick<QuestionsDynamoEntry, orgIdAndQuestionId> {
  newQuestionValues: { [key: string] };
}

type GetAllQuestionsInStageOutput = GetQuestionOutput[];
