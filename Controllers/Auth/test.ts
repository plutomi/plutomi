import { User } from '../../entities/User';
import { Request, Response } from 'express';

export const testt = async (req: Request, res: Response) => {
  await User.updateOne(
    {
      email: 'contact@josevalerio.com',
    },
    {
      firstName: 'beeeeeeeans',
    },
  );

  return res.status(200).json({ message: 'Success' });
};
