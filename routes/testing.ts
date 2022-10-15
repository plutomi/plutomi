import { Router } from 'express';
import API from '../Controllers';

export const testing = Router();

testing.get('/create', API.Testing.createUser);
testing.get('/get', API.Testing.getUsers);
