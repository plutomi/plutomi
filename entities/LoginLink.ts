import { Schema, model } from 'mongoose';
import { baseSchema, IBase } from './Base';
import dayjs from 'dayjs';
import { User } from './User';

export interface ILoginLink extends IBase {
  expireAt: Date;
  user: Schema.Types.ObjectId;
}

export const loginLinkSchema = new Schema<ILoginLink>({
  ...baseSchema.obj,
  createdAt: {
    type: Date,
    default: () => Date.now(),
    expires: 60 * 15, // 15 min
  },
  user: { type: Schema.Types.ObjectId, ref: User },
});

export const LoginLink = model<ILoginLink>('LoginLink', loginLinkSchema);
