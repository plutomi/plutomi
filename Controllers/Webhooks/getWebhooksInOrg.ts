import { Request, Response } from 'express';
import { Webhook } from '../../entities/Webhooks';
import { DB } from '../../models';
import * as CreateError from '../../utils/createError';

export const getWebhooksInOrg = async (req: Request, res: Response) => {
  const { user } = req;

  try {
    const webhooks = await Webhook.find({
      org: user.org,
    });
    return res.status(200).json(webhooks);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve webhooks in org' });
  }
};
