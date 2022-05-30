import { Request, Response } from 'express';
import { getInvitesForUser } from '../../models/Invites';
import * as CreateError from '../../utils/createError';

const main = async (req: Request, res: Response) => {
  const { session } = res.locals;
  const [invites, error] = await getInvitesForUser({
    userId: session.userId,
  });

  if (error) {
    const { status, body } = CreateError.SDK(error, 'An error ocurred retrieving invites');
    return res.status(status).json(body);
  }

  return res.status(200).json(invites);
};
export default main;
