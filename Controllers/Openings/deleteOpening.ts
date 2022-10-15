import { Request, Response } from 'express';
import { Opening } from '../../entities';
import { DB } from '../../models';
import { IndexedEntities } from '../../types/main';
import * as CreateError from '../../utils/createError';
import { findInTargetArray } from '../../utils/findInTargetArray';

export const deleteOpening = async (req: Request, res: Response) => {
  const { openingId } = req.params;
  const { user, entityManager } = req;

  let openingToDelete: Opening;
  const orgId = findInTargetArray({ entity: IndexedEntities.Org, targetArray: user.target });
  try {
    openingToDelete = await entityManager.findOne(Opening, {
      id: openingId,
      target: {
        // Should be redundant
        id: orgId,
        type: IndexedEntities.Org,
      },
    });

    if (!openingToDelete) {
      return res.status(404).json({ message: 'Opening not found!' });
    }
  } catch (error) {
    const message = `An error ocurred retrieving opening info`;
    console.error(message, error);
    return res.status(500).json({ message, error });
  }

  try {
    await entityManager.removeAndFlush(Opening);
  } catch (error) {
    const message = `An error ocurred deleting that opening`;
    console.error(message, error);
    return res.status(500).json({ message, error });
  }
  return res.status(200).json({ message: 'Opening deleted!' });
};
