import { Request, Response } from 'express';
import Joi from 'joi';
import * as CreateError from '../../utils/createError';
import { JOI_SETTINGS, LIMITS } from '../../Config';
import { DynamoWebhook } from '../../types/dynamo';
import { Webhook } from '../../entities/Webhooks';

export interface APIUpdateWebhookOptions
  extends Partial<Pick<DynamoWebhook, 'webhookName' | 'webhookUrl' | 'description'>> {}

const schema = Joi.object({
  webhookUrl: Joi.string().uri(),
  webhookName: Joi.string().max(100).min(1),
  description: Joi.string().allow('').max(LIMITS.MAX_WEBHOOK_DESCRIPTION_LENGTH),
}).options(JOI_SETTINGS);

export const updateWebhook = async (req: Request, res: Response) => {
  try {
    await schema.validateAsync(req.body);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }

  let updatedValues: APIUpdateWebhookOptions = {};
  const { user } = req;
  const { webhookId } = req.params;

  try {
    const webhook = await Webhook.findById(webhookId, {
      org: user.org,
    });

    if (!webhook) {
      return res.status(404).json({ message: 'Webhook not found' });
    }

    if (req.body.webhookUrl) {
      webhook.url = req.body.webhookUrl;
    }

    if (req.body.webhookName) {
      webhook.name = req.body.webhookName;
    }

    if (req.body.description || req.body.description === '') {
      webhook.description = req.body.description;
    }

    await webhook.save();
    return res.status(200).json({ message: 'Webhook updated!' });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve webhook data' });
  }
};
