import { Router } from 'express';
import API from '../Controllers';
import withHasOrg from '../middleware/withHasOrg';
import withSession from '../middleware/withSession';

export const stages = Router();

stages.use(withSession);
stages.use(withHasOrg);

stages.post('', API.Stages.createStage);
