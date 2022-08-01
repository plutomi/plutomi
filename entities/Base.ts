import { Schema } from 'mongoose';
import { DEFAULTS } from '../Config';

export const baseSchema = new Schema({
  createdAt: {
    type: Date,
    immutable: true,
    default: () => Date.now(),
  },
  updatedAt: {
    type: Date,
    default: () => Date.now(),
  },
  orgId: {
    type: String,
    default: DEFAULTS.NO_ORG,
  },
});

baseSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});
