import { Schema, model } from 'mongoose';
import { baseSchema, IBase } from './Base';
import { Opening } from './Opening';
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
  target: [
    { org: { type: Schema.Types.ObjectId, ref: Org } },
    { openingId: { type: Schema.Types.openingId, ref: Opening } },
    { totalApplicants: { type: Number, default: 0 } },
  ],
  totalQuestions: { type: Number, default: 0 },
  questionOrder: [{ type: Schema.Types.ObjectId, ref: Question }],
});

export const Stage = model<IStage>('Stage', stageSchema);
