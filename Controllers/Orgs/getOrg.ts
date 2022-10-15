import { Request, Response } from 'express';
import { Org } from '../../entities';
import { IndexedEntities } from '../../types/main';
import { findInTargetArray } from '../../utils/findInTargetArray';

export const getOrg = async (req: Request, res: Response) => {
  const { user, entityManager } = req;

  let org: Org;

  const orgId = findInTargetArray({ entity: IndexedEntities.Org, targetArray: user.target });

  try {
    org = await entityManager.findOne(Org, {
      orgId: orgId,
    });
  } catch (error) {
    console.error(`An error ocurred returning org info`, error);
    return res.status(500).json({ message: 'An error ocurred returning org info', error });
  }

  // Not sure how this would be possible but :)
  if (!org) {
    return res.status(404).json({ message: 'Org not found' });
  }

  return res.status(200).json(org);
};
