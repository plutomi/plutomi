import { Handler, Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { User } from '../../entities/User';

export const createUser: Handler = async (req: Request, res: Response) => {
  const newUser = new User(nanoid(12), nanoid(12), nanoid(12));

  try {
    console.log(`Attempting to save user`, newUser);

    await req.entityManager.persistAndFlush(newUser);
    res.status(200).json({ message: 'User created!', newUser });
  } catch (error) {
    console.error(`Error saving user`, error);
    res.status(500).json({ message: 'Error saving user', error });
  }
};
