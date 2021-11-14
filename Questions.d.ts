import { EntityTypes } from "./additional";

export interface QuestionsDynamoEntry {
  /**
   * The primary key for the question. Variables are `orgId` and `questionId`
   */
  PK: `ORG#${string}#QUESTION#${string}`;
  /**
   * Sort key for the question. In this case, it's just the {@link EntityTypes.STAGE_QUESTION}
   */
  SK: EntityTypes.STAGE_QUESTION;
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
   * The entityType {@link EntityTypes.STAGE_QUESTION}
   */
  entityType: EntityTypes.STAGE_QUESTION;
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
