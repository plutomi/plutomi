import { Schema, model } from 'mongoose';
import { baseSchema, IBase } from './Base';

export interface IOrg extends IBase {
  totalApplicants: number;
  totalOpenings: number;
  totalUsers: number;
  totalWebhooks: number;
  totalQuestions: number;
  displayName: string;
}

export const orgSchema = new Schema<IOrg>({
  ...baseSchema.obj,
  totalApplicants: { type: Number, default: 0 },
  totalOpenings: { type: Number, default: 0 },
  totalUsers: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  totalWebhooks: { type: Number, default: 0 },
  displayName: String,
});

export const Org = model<IOrg>('Org', orgSchema);
