import { User } from '../../entities/User';
import { Request, Response } from 'express';

export const testt = async (req: Request, res: Response) => {
  try {
    const q = await User.updateOne(
      {
        _id: '62e767485bd43a1e465d9141',
      },
      {
        verifiedEmail: true,
      },
      {
        upsert: true,
      },
    );
    console.log(q);
    return res.status(200).json({ user: q });
  } catch (error) {
    console.error(`ERROR RETRIEVING`, error);
    return res.status(500).json({ message: 'DB error' });
  }

  return res.status(200).json({ message: 'Success' });
};
