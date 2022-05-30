import { Request, Response } from 'express';
import { getInvitesForOrg } from '../../../models/Invites';
import * as CreateError from '../../../utils/createError';

export const main = async (req: Request, res: Response) => {
  const { orgId } = req.params;

  const [invites, error] = await getInvitesForOrg({ orgId });

  if (error) {
    const { status, body } = CreateError.SDK(error, 'Unable to retrieve invites for org');
    return res.status(status).json(body);
  }

  return res.status(200).json(invites);
};
