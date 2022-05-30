import { Request, Response } from 'express';
import * as Webhooks from '../../models/Webhooks';
import * as CreateError from '../../utils/createError';

const main = async (req: Request, res: Response) => {
  const { session } = res.locals;

  const [success, failure] = await Webhooks.DeleteWebhookFromOrg({
    orgId: session.orgId,
    webhookId: req.params.webhookId,
  });

  if (failure) {
    if (failure.name === 'TransactionCanceledException') {
      return res.status(401).json({ message: 'It seems like that webhook no longer exists' });
    }

    const { status, body } = CreateError.SDK(failure, 'An error ocurred deleting that webhook');
    return res.status(status).json(body);
  }

  return res.status(200).json({ message: 'Webhook deleted!' });
};
export default main;
