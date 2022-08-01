import { Schema, model } from 'mongoose';
import { baseSchema, IBase } from './Base';
import dayjs from 'dayjs';
import { User } from './User';

export interface ILoginLink extends IBase {
  expiresAt: Date;
  user: Schema.Types.ObjectId;
}

export const loginLinkSchema = new Schema<ILoginLink>({
  ...baseSchema.obj,
  expiresAt: {
    type: Date,
    default: () => dayjs(Date.now()).add(15, 'minutes'),
  },
  user: { type: Schema.Types.ObjectId, ref: User },
});

export const LoginLink = model<ILoginLink>('LoginLink', loginLinkSchema);
