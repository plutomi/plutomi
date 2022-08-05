import { Request, Response } from 'express';
import { OrgInvite } from '../../entities/OrgInvite';
import { User } from '../../entities/User';
import { DB } from '../../models';
import * as CreateError from '../../utils/createError';

export const rejectInvite = async (req: Request, res: Response) => {
  const { inviteId } = req.params;
  const { user } = req;

  // TODo this needs to be a transaction
  try {
    await OrgInvite.deleteOne({
      _id: inviteId,
      user,
    });

    try {
      await User.updateOne(
        {
          _id: user._id,
        },
        {
          $inc: {
            totalInvites: -1,
          },
        },
      );
      return res.status(200).json({ message: 'Invite rejected!' });
    } catch (error) {
      return res.status(500).json({
        message: 'Invite was rejected, but unable to decrement totalInvites property on user',
      });
    }
  } catch (error) {
    return res.status(500).json({ message: 'An error ocurred deleting that invite' });
  }

  return res.status(200).json({ message: 'Invite rejected!' });
};
