import { Router } from 'express';
import API from '../../controllers';
import withHasOrg from '../middleware/withHasOrg';
import withSession from '../middleware/withSession';

export const openings = Router();

openings.use(withSession);
openings.use(withHasOrg);

// openings.post('', API.Openings.createOpening);
// openings.get('', API.Openings.getOpeningsInOrg);
// openings.get('/:openingId', API.Openings.getOpening);
// openings.delete('/:openingId', API.Openings.deleteOpening);
// openings.put('/:openingId', API.Openings.updateOpening);
// openings.get('/:openingId/stages', API.Stages.getStagesInOpening);
