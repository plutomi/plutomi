import { Schema } from 'mongoose';
import { DEFAULTS } from '../Config';
const { ObjectId } = Schema.Types;

export const userSchema = new Schema({
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
  firstName: { type: String, default: DEFAULTS.FIRST_NAME },
  lastName: { type: String, default: DEFAULTS.LAST_NAME },
  email: {
    type: String,
    required: true,
  },
});

userSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});
