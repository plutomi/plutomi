import { Request, Response } from 'express';
import { DB } from '../../models';
import * as CreateError from '../../utils/createError';

export const rejectInvite = async (req: Request, res: Response) => {
  const { inviteId } = req.params;
  const { user } = req;
  const [deleted, error] = await DB.Invites.deleteInvite({
    inviteId,
    userId: user.userId,
  });

  if (error) {
    const { status, body } = CreateError.SDK(error, 'We were unable to reject that invite');
    return res.status(status).json(body);
  }

  return res.status(200).json({ message: 'Invite rejected!' });
};
