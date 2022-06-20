import { Router } from 'express';
import API from '../Controllers';
import withSession from '../middleware/withSession';
import withHasOrg from '../middleware/withHasOrg';

export const applicants = Router();

applicants.post('', API.Applicants.createApplicant);

applicants.use(withSession);
applicants.use(withHasOrg);

applicants.get('/:applicantId', API.Applicants.getApplicantById);
