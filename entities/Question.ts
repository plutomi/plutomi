import { Schema, model } from 'mongoose';
import { baseSchema, IBase } from './Base';
import { Org } from './Org';

export interface IQuestion extends IBase {
  totalStages: 0;
  title: string;
  org: Schema.Types.ObjectId;
  description?: string;
}

export const questionSchema = new Schema<IQuestion>({
  ...baseSchema.obj,
  target: {
    type: [{ org: { type: Schema.Types.ObjectId, ref: Org } }],
    index: true,
  },
  totalStages: { type: Number, default: 0 },
  title: { type: String, required: true },
  description: String,
});

export const Question = model<IQuestion>('Question', questionSchema);
