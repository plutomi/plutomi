import { Schema, model } from 'mongoose';
import { OpeningState } from '../Config';
import { baseSchema, IBase } from './Base';
import { Org } from './Org';

export interface IOpening extends IBase {
  totalApplicants: number;
  totalStages: number;
  name: string;
  visibility: OpeningState;
  org: Schema.Types.ObjectId;
}

export const openingSchema = new Schema<IOpening>({
  ...baseSchema.obj,
  totalApplicants: { type: Number, default: 0 },
  totalStages: { type: Number, default: 0 },
  name: { type: String, required: true },
  org: { type: Schema.Types.ObjectId, ref: Org },
  visibility: {
    type: String,
    enum: OpeningState,
    default: OpeningState.PRIVATE,
  },
});

export const Opening = model<IOpening>('Opening', openingSchema);
