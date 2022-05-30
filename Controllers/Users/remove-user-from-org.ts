import { Request, Response } from 'express';
import * as Orgs from '../../models/Orgs';
import * as CreateError from '../../utils/createError';
import * as Users from '../../models/Users';

const main = async (req: Request, res: Response) => {
  const { session } = res.locals;
  const { orgId, userId } = req.params;

  if (userId === session.userId) {
    return res.status(403).json({
      message:
        "You cannot remove yourself from an org. If you're the only user, delete the org instead",
    });
  }
  const [org, orgError] = await Orgs.GetOrgById({
    orgId,
  });

  if (orgError) {
    const { status, body } = CreateError.SDK(
      orgError,
      'An error ocurred retrieving the info for this org',
    );

    return res.status(status).json(body);
  }

  if (!org) {
    return res.status(404).json({ message: `No org found with id of '${orgId}` });
  }

  const [removed, removeError] = await Users.RemoveUserFromOrg({
    // if this doesn't match the createdBy ID on the org,
    // Dynamo will error
    createdById: session.userId,
    orgId: org.orgId,
    userId,
  });

  if (removeError) {
    // TODO there are two conditional checks, we should narrow this down
    if (removeError.name === 'TransactionCanceledException') {
      return res.status(403).json({
        message: 'You must be the creator of the org to remove users',
      });
    }

    const { status, body } = CreateError.SDK(
      removeError,
      'An error ocurred removing this user form your org',
    );
    return res.status(status).json(body);
  }

  return res.status(200).json({ message: 'User removed!' });
};
export default main;
