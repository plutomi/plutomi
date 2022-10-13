import { Request, Response } from 'express';
import { Opening } from '../../entities';
import { DB } from '../../models';
import * as CreateError from '../../utils/createError';

export const deleteOpening = async (req: Request, res: Response) => {
  const { openingId } = req.params;
  const { user, entityManager } = req;

  let openingToDelete: Opening;
  try {
    openingToDelete = await entityManager.findOne(Opening, { org: user.org, id: openingId });

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
