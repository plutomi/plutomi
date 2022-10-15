import { Request, Response } from 'express';
import Joi from 'joi';
import { JOI_SETTINGS, LIMITS } from '../../Config';
import * as CreateError from '../../utils/createError';
import { DynamoWebhook } from '../../types/dynamo';
import { DB } from '../../models';

export type APICreateWebhookOptions = Pick<
  DynamoWebhook,
  'webhookUrl' | 'webhookName' | 'description'
>;

const schema = Joi.object({
  body: {
    webhookUrl: Joi.string().uri(),
    webhookName: Joi.string().max(100).min(1),
    description: Joi.string().allow('').max(LIMITS.MAX_WEBHOOK_DESCRIPTION_LENGTH),
  },
}).options(JOI_SETTINGS);

export const createWebhook = async (req: Request, res: Response) => {
  const { user } = req;
  try {
    await schema.validateAsync(req);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }
  return res.status(200).json({ message: 'TODO Endpoint temporarily disabled!' });

  // const { webhookUrl, webhookName, description }: APICreateWebhookOptions = req.body;

  // const [created, createWebhookError] = await DB.Webhooks.createWebhook({
  //   orgId: user.orgId,
  //   webhookUrl,
  //   description,
  //   webhookName,
  // });

  // if (createWebhookError) {
  //   const { status, body } = CreateError.SDK(
  //     createWebhookError,
  //     'An error ocurred creating that webhook',
  //   );
  //   return res.status(status).json(body);
  // }

  // return res.status(201).json({ message: 'Webhook created!' });
};
