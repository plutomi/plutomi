import { Handler, Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { User } from '../../entities';

export const createUser: Handler = async (req: Request, res: Response) => {
  const newUser = new User({
    firstName: nanoid(12),
    lastName: nanoid(12),
    target: [{ id: nanoid(12), type: 'emsaasail' }],
  });

  try {
    console.log(`Attempting to save user`, newUser);

    const user = await req.entityManager.persistAndFlush(newUser);
    res.status(200).json({ message: 'User created!', user });
  } catch (error) {
    console.error(`Error saving user`, error);
    res.status(500).json({ message: 'Error saving user', error });
  }
};
