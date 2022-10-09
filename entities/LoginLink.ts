import { Schema, model } from 'mongoose';
import { baseSchema, IBase } from './Base';
import dayjs from 'dayjs';
import { User } from './User';

export interface ILoginLink extends IBase {
  user: Schema.Types.ObjectId;
}

export const loginLinkSchema = new Schema<ILoginLink>({
  ...baseSchema.obj,
  target: {
    type: [{ user: { type: Schema.Types.ObjectId, ref: User } }],
    index: true,
  },
  createdAt: {
    type: Date,
    default: () => Date.now(),
    expires: 60 * 15, // 15 min
  },
});

export const LoginLink = model<ILoginLink>('LoginLink', loginLinkSchema);
