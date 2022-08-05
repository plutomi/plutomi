import { Request, Response } from 'express';
import { Org } from '../../entities/Org';

export const getOrg = async (req: Request, res: Response) => {
  const { user } = req;

  try {
    const org = await Org.findById(user.org);

    if (!org) {
      // Not sure how this would be possible
      return res.status(404).json({ message: 'Org not found' }); //
    }

    return res.status(200).json(org);
  } catch (error) {
    return res.status(500).json({ message: 'An error ocurred retrieving an org' });
  }
};
