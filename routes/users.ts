import { Router } from 'express';
import API from '../Controllers';
import withHasOrg from '../middleware/withHasOrg';
import withSession from '../middleware/withSession';

export const users = Router();

users.use(withSession);

users.get('/me', API.Users.me);
users.get('/:userId', API.Users.getUser);
users.put('/:userId', API.Users.updateUser);

users.use(withHasOrg);
users.get('', API.Users.getUsersInOrg);
