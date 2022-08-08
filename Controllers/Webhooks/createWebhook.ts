import { Request, Response } from 'express';
import Joi from 'joi';
import { JOI_SETTINGS, LIMITS } from '../../Config';
import * as CreateError from '../../utils/createError';
import { DynamoWebhook } from '../../types/dynamo';
import { DB } from '../../models';
import { Webhook } from '../../entities/Webhooks';
import { Org } from '../../entities/Org';

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

  const { webhookUrl, webhookName, description }: APICreateWebhookOptions = req.body;

  try {
    const newWebhook = new Webhook({
      org: user.org,
      url: webhookUrl,
      description,
      name: webhookName,
    });

    await newWebhook.save();

    try {
      await Org.updateOne(
        {
          _id: user.org,
        },
        {
          $inc: {
            totalWebhooks: 1,
          },
        },
      );

      return res.status(201).json({message: "Webhook created!"})
    } catch (error) {
      return res
        .status(201)
        .json({ message: 'Webhook created but unable to update totalWebhook count on org' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'An errror ocurred creating webhook' });
  }
};
