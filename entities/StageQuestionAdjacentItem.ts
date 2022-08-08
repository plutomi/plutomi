import { Schema, model } from 'mongoose';
import { baseSchema, IBase } from './Base';
import { Org } from './Org';
import { Question } from './Question';
import { Stage } from './Stage';

// Used for getting all stages a question as we don't have to keep references on either item itself
export interface IStageQuestionAdjacentItem extends IBase {
  questionId: Schema.Types.ObjectId;
  stageId: Schema.Types.ObjectId;
  org: Schema.Types.ObjectId;
}

export const stageQuestionAdjacentItemSchema = new Schema<IStageQuestionAdjacentItem>({
  ...baseSchema.obj,
  org: { type: Schema.Types.ObjectId, ref: Org },
  questionId: { type: Schema.Types.ObjectId, ref: Question },
  stageId: { type: Schema.Types.ObjectId, ref: Stage },
});

export const StageQuestionAdjacentItem = model<IStageQuestionAdjacentItem>(
  'StageQuestionAdjacentItem',
  stageQuestionAdjacentItemSchema,
);
