import { number } from 'joi';
import { Schema, model } from 'mongoose';
import { DEFAULTS } from '../Config';
import { baseSchema, IBase } from './Base';
import { Org } from './Org';

export interface IUser extends IBase {
  email: string;
  firstName: string;
  lastName: string;
  totalInvites: number;
  verifiedEmail: boolean;
  org: Schema.Types.ObjectId; // TODO requires null check for defauilts.no_org
  orgJoinDate: Date;
}

export const userSchema = new Schema<IUser>({
  ...baseSchema.obj,
  target: [
    {
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },
    },
    {
      org: { type: Schema.Types.ObjectId, ref: Org, default: null },
    },
  ],
  firstName: { type: String, default: DEFAULTS.FIRST_NAME, trim: true },
  lastName: { type: String, default: DEFAULTS.LAST_NAME, trim: true },
  totalInvites: { type: Number, default: 0 },
  verifiedEmail: { type: Boolean, default: false },

  orgJoinDate: { type: Date },
});

export const User = model<IUser>('User', userSchema);
