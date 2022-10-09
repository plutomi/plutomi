import { Schema, model } from 'mongoose';
import { baseSchema, IBase } from './Base';
import { Opening } from './Opening';
import { Org } from './Org';
import { Stage } from './Stage';

export interface IApplicant extends IBase {
  verifiedEmail: boolean;
  org: Schema.Types.ObjectId;
}

export const applicantSchema = new Schema<IApplicant>({
  ...baseSchema.obj,
  target: {
    type: [
      { org: { type: Schema.Types.ObjectId, ref: Org } },
      { opening: { type: Schema.Types.ObjectId, ref: Opening } },
      { stage: { type: Schema.Types.ObjectId, ref: Stage } },
    ],
    index: true,
  },
  verifiedEmail: { type: Boolean, default: false },
});

export const Applicant = model<IApplicant>('Applicant', applicantSchema);
