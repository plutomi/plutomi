import { Router } from 'express';
import API from '../controllers';
import withHasOrg from '../middleware/withHasOrg';
import withSession from '../middleware/withSession';
import withSameOrg from '../middleware/withSameOrg';

export const orgs = Router();
orgs.use(withSession);

orgs.post('', API.Orgs.createAndJoinOrg);

orgs.use(withHasOrg);

orgs.get('', API.Orgs.getOrg);
orgs.delete('', API.Orgs.leaveAndDeleteOrg);
orgs.get('/:orgId/invites', withSameOrg, API.Invites.getInvitesForOrg);
orgs.delete('/:orgId/users/:userId', withSameOrg, API.Users.removeUserFromOrg); // TODO put instead?
orgs.delete('/:orgId/invites/:inviteId', withSameOrg, API.Invites.cancelInvite);
