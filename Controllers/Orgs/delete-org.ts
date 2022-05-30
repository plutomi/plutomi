import { Request, Response } from 'express';
import { getOrg, leaveAndDeleteOrg } from '../../models/Orgs';
import * as CreateError from '../../utils/createError';

const main = async (req: Request, res: Response) => {
  const { session } = res.locals;
  const { orgId } = session;

  const [org, error] = await getOrg({ orgId });

  if (error) {
    const { status, body } = CreateError.SDK(error, 'Unable to retrieve org info');
    return res.status(status).json(body);
  }

  if (!org) {
    return res.status(404).json({ message: 'Org not found' });
  }
  if (org.totalUsers > 1) {
    return res.status(403).json({
      message: 'You cannot delete this org as there are other users in it',
    });
  }

  // Transaction - updates the user with default org values
  const [success, failure] = await leaveAndDeleteOrg({
    orgId,
    userId: session.userId,
  });

  if (failure) {
    const { status, body } = CreateError.SDK(failure, 'We were unable to remove you from the org');
    return res.status(status).json(body);
  }

  return res.status(200).json({ message: 'Org deleted!' });
};
export default main;
