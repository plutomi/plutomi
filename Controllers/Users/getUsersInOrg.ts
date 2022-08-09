import { Request, Response } from 'express';
import { User } from '../../entities/User';

export const getUsersInOrg = async (req: Request, res: Response) => {
  const { user } = req;

  if (!user.org) {
    return res.status(400).json({ message: 'You are not in an org' });
  }
  try {
    const users = await User.find(
      {
        org: user.org,
      },
      {
        _id: 1,
        org: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
        orgJoinDate: 1,
      },
    );

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: 'An error ocurred retrieving users in org' });
  }
};
