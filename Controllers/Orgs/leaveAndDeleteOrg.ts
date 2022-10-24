import { Request, Response } from 'express';
import { Org } from '../../entities';
import { IndexedEntities } from '../../types/main';
import { findInTargetArray } from '../../utils/findInTargetArray';

export const leaveAndDeleteOrg = async (req: Request, res: Response) => {
  const { user, entityManager } = req;
  const orgId = findInTargetArray({ entity: IndexedEntities.Org, targetArray: user.target });

  let org: Org;

  try {
    org = await req.entityManager.findOne(Org, {
      orgId,
    });
  } catch (error) {
    console.error(`Error retrieving org info`, error);
    return res.status(500).json({ message: 'An error ocurred retrieving your org info', error });
  }

  if (!org) {
    return res.status(404).json({ message: 'Org not found' });
  }
  if (org.totalUsers > 1) {
    return res.status(403).json({
      message: 'You cannot delete this org as there are other users in it',
    });
  }

  user.orgJoinDate = undefined;
  const indexOfOrg = user.target.findIndex((item) => item.type === IndexedEntities.Org);
  user.target.splice(indexOfOrg, 1); // Removing the org from the user
  user.orgJoinDate = undefined;
  entityManager.remove(org); // TODO cascading deletions!

  try {
    await entityManager.flush();
  } catch (error) {
    console.error(`An error ocurred deleting your org`, error);
    return res.status(500).json({ message: 'An error ocurred deleting your org', error });
  }

  return res.status(200).json({ message: 'Org deleted!' });
};
