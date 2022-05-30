import { Request, Response } from 'express';
import { getWebhooksInOrg } from '../../models/Webhooks';
import * as CreateError from '../../utils/createError';

const main = async (req: Request, res: Response) => {
  const { session } = res.locals;
  const [webhooks, webhooksError] = await getWebhooksInOrg({
    orgId: session.orgId,
  });

  if (webhooksError) {
    const { status, body } = CreateError.SDK(webhooksError, 'An error ocurred retrieving webhooks');

    return res.status(status).json(body);
  }

  return res.status(200).json(webhooks);
};
export default main;
