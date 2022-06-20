import { Router } from 'express';
import API from '../Controllers';
import withHasOrg from '../middleware/withHasOrg';
import withSession from '../middleware/withSession';

export const invites = Router();

invites.use(withSession);

invites.get('', API.Invites.getInvitesForUser);
invites.delete('/:inviteId', API.Invites.rejectInvite);
invites.post('/:inviteId', API.Invites.acceptInvite);

invites.use(withHasOrg);
invites.post('', API.Invites.createInvite);
