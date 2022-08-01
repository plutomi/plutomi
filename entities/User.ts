import { Schema } from 'mongoose';
import { DEFAULTS } from '../Config';
import { baseSchema } from './Base';

export const userSchema = new Schema({
  ...baseSchema.obj,
  firstName: { type: String, default: DEFAULTS.FIRST_NAME },
  lastName: { type: String, default: DEFAULTS.LAST_NAME },
  email: {
    type: String,
    required: true,
  },
});
