import { Schema, model } from 'mongoose';
import { DEFAULTS } from '../Config';
import { baseSchema, IBase } from './Base';

export interface IUser extends IBase {
  email: string;
  firstName: string;
  lastName: string;
}

export const userSchema = new Schema<IUser>({
  ...baseSchema.obj,
  firstName: { type: String, default: DEFAULTS.FIRST_NAME, trim: true },
  lastName: { type: String, default: DEFAULTS.LAST_NAME, trim: true },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
});

export const User = model<IUser>('User', userSchema);
