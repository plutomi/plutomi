import { Request, Response } from 'express';
import Joi from 'joi';
import * as CreateError from '../../utils/createError';
import { JOI_SETTINGS, LIMITS } from '../../Config';
import { DynamoWebhook } from '../../types/dynamo';
import { DB } from '../../models';

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

  if (req.body.webhookUrl) {
    updatedValues.webhookUrl = req.body.webhookUrl;
  }

  if (req.body.webhookName) {
    updatedValues.webhookName = req.body.webhookName;
  }

  if (req.body.description || req.body.description === '') {
    updatedValues.description = req.body.description;
  }

  const [updatedWebhook, error] = await DB.Webhooks.updateWebhook({
    webhookId,
    orgId: user.orgId,
    updatedValues,
  });

  if (error) {
    const { status, body } = CreateError.SDK(error, 'An error ocurred updating this webhook');
    return res.status(status).json(body);
  }

  return res.status(200).json({
    message: 'Webhook updated!',
  });
};
