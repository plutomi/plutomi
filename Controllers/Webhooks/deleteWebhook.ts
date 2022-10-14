import { Request, Response } from 'express';
import { DB } from '../../models';
import { IndexedEntities } from '../../types/main';
import * as CreateError from '../../utils/createError';
import { findInTargetArray } from '../../utils/findInTargetArray';

export const deleteWebhook = async (req: Request, res: Response) => {
  const { user } = req;
  const orgId = findInTargetArray({
    entity: IndexedEntities.Org,
    targetArray: user.target,
  });
  const [success, failure] = await DB.Webhooks.deleteWebhook({
    orgId,
    webhookId: req.params.webhookId,
    updateOrg: true,
  });

  if (failure) {
    if (failure.name === 'TransactionCanceledException') {
      return res.status(404).json({ message: 'It seems like that webhook no longer exists' });
    }

    const { status, body } = CreateError.SDK(failure, 'An error ocurred deleting that webhook');
    return res.status(status).json(body);
  }

  return res.status(200).json({ message: 'Webhook deleted!' });
};
