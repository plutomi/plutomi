import { Router } from 'express';
import API from '../Controllers';
import withSession from '../middleware/withSession';

export const auth = Router();

auth.post('/request-login-link', API.Auth.requestLoginLink);
auth.get('/login', API.Auth.login);

auth.use(withSession);
auth.post('/logout', API.Auth.logout);
