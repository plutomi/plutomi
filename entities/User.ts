import { number } from 'joi';
import { Schema, model } from 'mongoose';
import { DEFAULTS } from '../Config';
import { baseSchema, IBase } from './Base';

export interface IUser extends IBase {
  email: string;
  firstName: string;
  lastName: string;
  totalInvites: number;
  verifiedEmail: boolean;
}

export const userSchema = new Schema<IUser>({
  ...baseSchema.obj,
  firstName: { type: String, default: DEFAULTS.FIRST_NAME, trim: true },
  lastName: { type: String, default: DEFAULTS.LAST_NAME, trim: true },
  totalInvites: { type: Number, default: 0 },
  verifiedEmail: { type: Boolean, default: false },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  orgId: {
    type: String,
    default: DEFAULTS.NO_ORG,
  },
});

export const User = model<IUser>('User', userSchema);
