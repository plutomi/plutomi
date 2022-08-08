import { Request, Response } from 'express';
import { DEFAULTS } from '../../Config';
import { Org } from '../../entities/Org';

export const getOrg = async (req: Request, res: Response) => {
  const { user } = req;

  if (user.org === DEFAULTS.NO_ORG) {
    return res.status(200).json({ message: "You're not in an org :)" });
  }

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
