import { Request, Response } from 'express';
import { getOrg } from '../../../models/Orgs';
import * as CreateError from '../../../utils/createError';

export const main = async (req: Request, res: Response) => {
  const { session } = res.locals;

  const [org, error] = await getOrg({ orgId: session.orgId });

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
