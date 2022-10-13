import { nanoid } from 'nanoid';
import { User } from '../entities/User';

export const createWebhook = async (req: Request, res: Response) => {
  const newUser = new User(nanoid(12), nanoid(12), nanoid(12));


  try {
    console.log(`Attempting to save user`, newUser)

    const save = await 
  } catch (error) {
    
    console.error(`Error saving user`, error)
  }
};
