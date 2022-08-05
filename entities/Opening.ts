import { Schema, model } from 'mongoose';
import { OpeningState } from '../Config';
import { baseSchema, IBase } from './Base';

export interface IOpening extends IBase {
  totalApplicants: number;
  totalStages: number;
  name: string;
  visibility: OpeningState;
}

export const openingSchema = new Schema<IOpening>({
  ...baseSchema.obj,
  totalApplicants: { type: Number, default: 0 },
  totalStages: { type: Number, default: 0 },
  name: { type: String },
  visibility: {
    type: String,
    enum: OpeningState,
    default: OpeningState.PRIVATE,
  },
});

export const Opening = model<IOpening>('Opening', openingSchema);
