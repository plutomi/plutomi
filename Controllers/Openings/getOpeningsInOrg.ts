import { Request, Response } from 'express';
import { Opening } from '../../entities';
import { DB } from '../../models';
import * as CreateError from '../../utils/createError';

export const getOpeningsInOrg = async (req: Request, res: Response) => {
  const { user, entityManager } = req;

  let openings: Opening[];

  try {
    openings = await entityManager.find(Opening, {
      org: user.org,
    });
  } catch (error) {
    const message = 'An error ocurred retrieving openings in your org';
    console.error(message, error);
    return res.status(500).json({ message, error });
  }

  return res.status(200).json(openings);
};
