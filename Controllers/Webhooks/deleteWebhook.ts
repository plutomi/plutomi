import { Request, Response } from 'express';
import * as CreateError from '../../utils/createError';
import { findInTargetArray } from '../../utils/findInTargetArray';

export const deleteWebhook = async (req: Request, res: Response) => {
  const { user } = req;
  // const orgId = findInTargetArray({
  //   entity: IdxTypes.Org,
  //   targetArray: user.target,
  // });

  return res.status(200).json({ message: 'Endpoint temp disabled' });

  // const [success, failure] = await DB.Webhooks.deleteWebhook({
  //   orgId,
  //   webhookId: req.params.webhookId,
  //   updateOrg: true,
  // });

  // if (failure) {
  //   if (failure.name === 'TransactionCanceledException') {
  //     return res.status(404).json({ message: 'It seems like that webhook no longer exists' });
  //   }

  //   const { status, body } = CreateError.SDK(failure, 'An error ocurred deleting that webhook');
  //   return res.status(status).json(body);
  // }

  // return res.status(200).json({ message: 'Webhook deleted!' });
};
