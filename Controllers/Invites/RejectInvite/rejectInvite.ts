import { Request, Response } from 'express';
import DB from '../../../models';
import * as CreateError from '../../../utils/createError';

export const main = async (req: Request, res: Response) => {
  const { session } = res.locals;
  const { inviteId } = req.params;

  const [deleted, error] = await DB.Invites.deleteInvite({
    inviteId,
    userId: session.userId,
  });

  if (error) {
    const { status, body } = CreateError.SDK(error, 'We were unable to reject that invite');
    return res.status(status).json(body);
  }

  return res.status(200).json({ message: 'Invite rejected!' });
};
