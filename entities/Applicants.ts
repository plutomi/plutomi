import { Schema, model } from 'mongoose';
import { baseSchema, IBase } from './Base';
import { Org } from './Org';

export interface IApplicant extends IBase {
  verifiedEmail: boolean;
  org: Schema.Types.ObjectId;
}

export const applicantSchema = new Schema<IApplicant>({
  ...baseSchema.obj,
  verifiedEmail: { type: Boolean, default: false },
  org: { type: Schema.Types.ObjectId, ref: Org },
});

export const User = model<IApplicant>('Applicant', applicantSchema);
