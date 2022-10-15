import { Request, Response } from 'express';
import * as CreateError from '../../utils/createError';
import { DB } from '../../models';

export const getInvitesForUser = async (req: Request, res: Response) => {
  const { user } = req;

  return res.status(200).json({ message: 'TODO Endpoint temporarily disabled!' });

  // const [invites, error] = await DB.Invites.getInvitesForUser({
  //   userId: user.userId,
  // });

  // if (error) {
  //   const { status, body } = CreateError.SDK(error, 'An error ocurred retrieving invites');
  //   return res.status(status).json(body);
  // }

  // return res.status(200).json(invites);
};
