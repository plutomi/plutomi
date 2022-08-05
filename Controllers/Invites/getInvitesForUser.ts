import { Request, Response } from 'express';
import * as CreateError from '../../utils/createError';
import { DB } from '../../models';
import { OrgInvite } from '../../entities/OrgInvite';

export const getInvitesForUser = async (req: Request, res: Response) => {
  const { user } = req;

  try {
    const invites = await OrgInvite.find({
      recipient: user,
      expiresAt: {
        $gt: new Date(),
      },
    });

    return res.status(200).json(invites);
  } catch (error) {
    return res.status(500).json({ message: 'An error ocurred retrieving invites for a user' });
  }
};
