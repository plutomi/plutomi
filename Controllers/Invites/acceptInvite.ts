import { Request, Response } from 'express';
import { DEFAULTS } from '../../Config';
import * as CreateError from '../../utils/createError';
import { DB } from '../../models';
import { OrgInvite } from '../../entities/Invites';
import { IOrg, Org } from '../../entities/Org';
import { User } from '../../entities/User';

export const acceptInvite = async (req: Request, res: Response) => {
  const { inviteId } = req.params;
  const { user } = req;

  if (user.orgId !== DEFAULTS.NO_ORG) {
    return res.status(403).json({
      message: `You already belong to an org: ${user.orgId} - delete it before joining another one!`,
    });
  }

  try {
    const invite = await OrgInvite.findOne({ _id: inviteId }).populate<{ org: IOrg }>('org');

    if (!invite) {
      return res.status(404).json({ message: 'Invite no longer exists' });
    }

    // Not sure how this would happen as we do a check before the invite
    // is sent to prevent this...

    await invite.populate('org');
    if (invite.org.orgId === user.orgId) {
      return res.status(400).json({ message: "It appears that you're already in this org!" });
    }

    if (invite.expiresAt <= new Date()) {
      return res.status(403).json({
        message:
          'It looks like that invite has expired, ask the org admin to send you another one!',
      });
    }

    // TODO accept invite,
    // TODO needs to be a transaction

    try {
      // Delete the org invite

      await OrgInvite.deleteOne({
        _id: invite._id,
      });

      try {
        await User.updateOne(
          {
            _id: user._id,
          },
          {
            $set: {
              orgId: invite.org._id,
              orgJoinDate: new Date(),
            },
          },
        );

        try {
          await Org.updateOne(
            {
              _id: invite.org._id,
            },
            {
              $inc: {
                totalUsers: 1,
              },
            },
          );
          return res.status(200).json({ message: 'Invite accepted!' });
        } catch (error) {
          return res.status(500).json({
            message: 'Invite accepted, user updated, but unable to increment user count on org',
          });
        }
      } catch (error) {
        return res
          .status(500)
          .json({ message: 'Invite deleted, but unable to update user org ID' });
      }
    } catch (error) {
      return res.status(500).json({ message: 'An error ocurred accepting your org invite: Deletion step' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'An error ocurred retrieving your invites' });
  }
};
