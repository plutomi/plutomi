import { Request, Response } from 'express';
import Joi from 'joi';
import { JOI_SETTINGS } from '../../Config';
import { Webhook } from '../../entities/Webhooks';
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

  try {
    const webhook = await Webhook.findById(webhookId, {
      org: user.org,
    });

    if (!webhook) {
      return res.status(404).json({ message: 'Webhook not found' });
    }

    return res.status(200).json(webhook);
  } catch (error) {
    return res.status(500).json({ message: 'An error recurred retrieving webhook info' });
  }
};
