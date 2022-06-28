import { Request, Response } from 'express';
import { DB } from '../../models';
import * as CreateError from '../../utils/createError';

export const getOrg = async (req: Request, res: Response) => {
  const { user } = req;

  const [org, error] = await DB.Orgs.getOrg({ orgId: user.orgId });

  if (error) {
    const { status, body } = CreateError.SDK(error, 'Unable to retrieve org info');

    return res.status(status).json(body);
  }

  // Not sure how this would be possible but :)
  if (!org) {
    return res.status(404).json({ message: 'Org not found' });
  }

  return res.status(200).json(org);
};
