import { Request, Response } from 'express';
import { Filter } from 'mongodb';
import { IndexableProperties } from '../../@types/indexableProperties';
import { InviteEntity } from '../../models';
import { findInTargetArray } from '../../utils';
import { collections } from '../../utils/connectToDatabase';

export const getInvitesForUser = async (req: Request, res: Response) => {
  const { user } = req;
  const userEmail = findInTargetArray(IndexableProperties.Email, user);
  try {
    const invitesFilter: Filter<InviteEntity> = {
      target: { property: IndexableProperties.Email, value: userEmail },
    };
    const userInvites = await collections.invites.find(invitesFilter).toArray();
    return res.status(200).json(userInvites);
  } catch (error) {
    const msg = 'An error ocurred retrieving invites';
    console.error(msg, error);
    return res.status(500).json({ message: 'An error ocurred retrieving your invites' });
  }
};
