import dayjs from 'dayjs';
import { number } from 'joi';
import { Schema, model } from 'mongoose';
import { DEFAULTS } from '../Config';
import { baseSchema, IBase } from './Base';
import { Org } from './Org';
import { User } from './User';

export interface IOrgInvite extends IBase {
  org: Schema.Types.ObjectId;
  expiresAt: Date;
  createdBy: Schema.Types.ObjectId;
  recipient: Schema.Types.ObjectId;
}

export const orgInviteSchema = new Schema<IOrgInvite>({
  ...baseSchema.obj,
  org: { type: Schema.Types.ObjectId, ref: 'Org' },
  createdBy: { type: Schema.Types.ObjectId, ref: User },
  recipient: { type: Schema.Types.ObjectId, ref: User },
  expiresAt: { type: Date, default: () => dayjs(new Date()).add(3, 'days').toDate() },
  // TODO add TTL index?
});

export const OrgInvite = model<IOrgInvite>('OrgInvite', orgInviteSchema);
