import { Router } from 'express';
import API from '../controllers';

export const publicInfo = Router();

publicInfo.get('/orgs/:orgId', API.PublicInfo.getPublicOrg);
publicInfo.get('/orgs/:orgId/openings', API.PublicInfo.getPublicOpeningsInOrg);
publicInfo.get('/orgs/:orgId/openings/:openingId', API.PublicInfo.getPublicOpening);
