import { Schema, model } from 'mongoose';
import { baseSchema, IBase } from './Base';
import { Org } from './Org';

export interface IWebhook extends IBase {
  org: Schema.Types.ObjectId;
  name: string;
  description: string;
  url: string;
}

export const webhookSchema = new Schema<IWebhook>({
  ...baseSchema.obj,
  target: {
    type: [{ org: { type: Schema.Types.ObjectId, ref: Org } }],
    index: true,
  },
  name: String,
  description: String,
  url: String,
});

export const Webhook = model<IWebhook>('Webhook', webhookSchema);
