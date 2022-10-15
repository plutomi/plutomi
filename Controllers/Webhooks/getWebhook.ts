import { Request, Response } from 'express';
import Joi from 'joi';
import { JOI_SETTINGS } from '../../Config';
import { DB } from '../../models';
import * as CreateError from '../../utils/createError';

const schema = Joi.object({
  params: {
    webhookId: Joi.string(),
  },
}).options(JOI_SETTINGS);

export const getWebhook = async (req: Request, res: Response) => {
  try {
    await schema.validateAsync(req);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }
  const { user } = req;
  const { webhookId } = req.params;

  return res.status(200).json({ message: 'TODO endpoint temporary disabled' });
  // const [webhook, error] = await DB.Webhooks.getWebhook({
  //   orgId: user.orgId,
  //   webhookId,
  // });

  // if (error) {
  //   const { status, body } = CreateError.SDK(error, 'An error ocurred retrieving your webhook');

  //   return res.status(status).json(body);
  // }
  // if (!webhook) {
  //   return res.status(404).json({ message: 'Webhook not found' });
  // }

  // return res.status(200).json(webhook);
};
