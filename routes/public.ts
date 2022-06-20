import { Router } from 'express';
import API from '../Controllers';

export const publicInfo = Router();

publicInfo.get('/orgs/:orgId', API.PublicInfo.getOrg);
publicInfo.get('/orgs/:orgId/openings', API.PublicInfo.getOpeningsInOrg);
publicInfo.get('/orgs/:orgId/openings/:openingId', API.PublicInfo.getOpening);
