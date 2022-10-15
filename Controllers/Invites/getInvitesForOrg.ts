import { Request, Response } from 'express';
import { DB } from '../../models';
import * as CreateError from '../../utils/createError';

export const getInvitesForOrg = async (req: Request, res: Response) => {
  const { orgId } = req.params;
  return res.status(200).json({ message: 'TODO Endpoint temporarily disabled!' });

  // const [invites, error] = await DB.Invites.getInvitesForOrg({ orgId });

  // if (error) {
  //   const { status, body } = CreateError.SDK(error, 'Unable to retrieve invites for org');
  //   return res.status(status).json(body);
  // }

  // return res.status(200).json(invites);
};
