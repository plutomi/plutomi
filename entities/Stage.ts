import { Schema, model } from 'mongoose';
import { baseSchema, IBase } from './Base';
import { Org } from './Org';
import { Question } from './Question';

export interface IStage extends IBase {
  totalApplicants: number;
  totalQuestions: number;
  name: string;
  openingId: Schema.Types.ObjectId;
  questionOrder: Schema.Types.ObjectId[]; // TODO ids of questions, should be linked list in another pr
  org: Schema.Types.ObjectId;
}

export const stageSchema = new Schema<IStage>({
  ...baseSchema.obj,
  totalApplicants: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  name: { type: String, required: true },
  org: { type: Schema.Types.ObjectId, ref: Org },
  questionOrder: [{ type: Schema.Types.ObjectId, ref: Question }],
});

export const Stage = model<IStage>('Stage', stageSchema);
