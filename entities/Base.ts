import { Schema } from 'mongoose';
import { DEFAULTS } from '../Config';

export interface IBase {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  orgId: string;
}

export const baseSchema = new Schema<IBase>({
  createdAt: {
    type: Date,
    immutable: true,
    default: () => Date.now(),
  },
  updatedAt: {
    type: Date,
    default: () => Date.now(),
  },
});

baseSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});
