import { Request, Response } from 'express';
import DB from '../../models';
import * as CreateError from '../../utils/createError';

export const getWebhooksInOrg = async (req: Request, res: Response) => {
  const { session } = res.locals;
  const [webhooks, webhooksError] = await DB.Webhooks.getWebhooksInOrg({
    orgId: session.orgId,
  });

  if (webhooksError) {
    const { status, body } = CreateError.SDK(webhooksError, 'An error ocurred retrieving webhooks');

    return res.status(status).json(body);
  }

  return res.status(200).json(webhooks);
};
