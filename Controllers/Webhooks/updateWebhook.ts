import { Request, Response } from 'express';
import Joi from 'joi';
import * as CreateError from '../../utils/createError';
import { JOI_GLOBAL_FORBIDDEN, JOI_SETTINGS, LIMITS } from '../../Config';
import { DynamoWebhook } from '../../types/dynamo';
import DB from '../../models';

export interface APIUpdateWebhookOptions
  extends Partial<Pick<DynamoWebhook, 'webhookName' | 'webhookUrl' | 'description'>> {
  [key: string]: any;
}

const JOI_FORBIDDEN_WEBHOOK = Joi.object({
  ...JOI_GLOBAL_FORBIDDEN,
  webhookId: Joi.any().forbidden(),
  GSI1PK: Joi.any().forbidden(),
  GSI1SK: Joi.any().forbidden(),
  url: Joi.string().uri().optional(),
  webhookName: Joi.string().max(100).min(1).optional(),
  description: Joi.string().allow('').max(LIMITS.MAX_WEBHOOK_DESCRIPTION_LENGTH).optional(),
});

const schema = Joi.object({
  body: JOI_FORBIDDEN_WEBHOOK,
}).options(JOI_SETTINGS);

export const updateWebhook = async (req: Request, res: Response) => {
  try {
    await schema.validateAsync(req);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }

  const { session } = res.locals;
  const { webhookId } = req.params;

  const [updatedWebhook, error] = await DB.Webhooks.updateWebhook({
    webhookId,
    orgId: session.orgId,
    newValues: req.body,
  });

  if (error) {
    const { status, body } = CreateError.SDK(error, 'An error ocurred updating this webhook');

    return res.status(status).json(body);
  }

  return res.status(200).json({
    message: 'Webhook updated!',
  });
};
