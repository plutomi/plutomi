import { Request, Response } from 'express';
import { Opening } from '../../entities/Opening';

export const getOpeningsInOrg = async (req: Request, res: Response) => {
  const { user } = req;

  try {
    const openings = await Opening.find({
      orgId: user.org,
    });

    return res.status(200).json(openings);
  } catch (error) {
    return res.status(500).json({ message: 'An error ocurred retrieving openings' });
  }
};
