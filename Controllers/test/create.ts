import { EntityTransformer } from '@mikro-orm/core';
import { Handler, Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { User } from '../../entities';
import { IndexedEntities } from '../../types/main';

export const createUser: Handler = async (req: Request, res: Response) => {
  const key = IndexedEntities.Email;
  const email = 'joseyvalerio@gmail.com';
  const newUser = new User({
    firstName: nanoid(12),
    lastName: nanoid(12),
    target: [{ id: email, type: key }],
  });

  try {
    console.log(`Attempting to save user`, newUser);

    await req.entityManager.persistAndFlush(newUser);
    console.log('Caved new user', newUser);

    const foundUser = await req.entityManager.findOne(User, {
      id: newUser.id,
    });
    res.status(200).json({ message: 'User created!', user: foundUser, newUser });
    console.log('After foundUser', foundUser);
    return;
  } catch (error) {
    console.error(`Error saving user`, error);
    res.status(500).json({ message: 'Error saving user', error });
  }
};
