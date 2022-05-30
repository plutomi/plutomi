import { Request, Response } from 'express';
import * as CreateError from '../../../utils/createError';
import DB from '../../../models';

export const main = async (req: Request, res: Response) => {
  const { session } = res.locals;
  const [invites, error] = await DB.Invites.getInvitesForUser({
    userId: session.userId,
  });

  if (error) {
    const { status, body } = CreateError.SDK(error, 'An error ocurred retrieving invites');
    return res.status(status).json(body);
  }

  return res.status(200).json(invites);
};
