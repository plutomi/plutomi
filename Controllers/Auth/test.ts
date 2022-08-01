import { User } from '../../entities/User';
import { Request, Response } from 'express';

export const testt = async (req: Request, res: Response) => {
  try {
    const q = await User.updateOne(
      {
        email: 'contact@josevalerio.com',
      },
      {
        firstName: 'eee',
      },
    );
    console.log(q.modifiedCount);
  } catch (error) {
    console.error(`ERROR UPDATING`, error);
    return res.status(500).json({ message: 'DB error' });
  }

  return res.status(200).json({ message: 'Success' });
};
