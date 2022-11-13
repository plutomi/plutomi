import { Request, Response } from 'express';
import { Filter } from 'mongodb';
import { IndexableProperties } from '../../@types/indexableProperties';
import { InviteEntity } from '../../models';
import { collections } from '../../utils/connectToDatabase';

export const getInvitesForOrg = async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const { user } = req;

  const { orgId: userOrgId } = user;
  if (orgId !== userOrgId) {
    return res.status(401).json({ message: 'You cannot view invites for this org' });
  }

  let invitesForOrg: InviteEntity[];
  try {
    const invitesFilter: Filter<InviteEntity> = {
      target: { property: IndexableProperties.Org, value: orgId },
    };
    invitesForOrg = (await collections.invites.find(invitesFilter).toArray()) as InviteEntity[];

    return res.status(200).json(invitesForOrg);
  } catch (error) {
    const msg = 'An error ocurred retrieving invites';
    console.error(msg, error);
    return res.status(500).json({ message: msg });
  }
};
