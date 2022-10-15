import { Handler, Request, Response } from 'express';
import { User } from '../../entities';

export const getUsers: Handler = async (req: Request, res: Response) => {
  try {
    console.log(`Attempting to get users`);

    const users = await req.entityManager.find(User, {});
    res.status(200).json({ message: 'Users found', users });
  } catch (error) {
    console.error(`Error retrieving users`, error);
    res.status(500).json({ message: 'Error retrieving users user', error });
  }
};
