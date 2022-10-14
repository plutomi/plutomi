import { Request, Response } from 'express';
import { Opening } from '../../entities';
import { IndexedEntities } from '../../types/main';
import { findInTargetArray } from '../../utils/findInTargetArray';

export const getOpeningsInOrg = async (req: Request, res: Response) => {
  const { user, entityManager } = req;

  const orgId = findInTargetArray({ entity: IndexedEntities.Org, targetArray: user.target });
  let openings: Opening[];

  try {
    // TODO: Add type safety on this search
    openings = await entityManager.find(Opening, {
      target: {
        id: orgId,
        type: IndexedEntities.Org,
      },
    });
  } catch (error) {
    const message = 'An error ocurred retrieving openings in your org';
    console.error(message, error);
    return res.status(500).json({ message, error });
  }

  return res.status(200).json(openings);
};
