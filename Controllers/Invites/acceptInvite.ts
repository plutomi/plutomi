import { Request, Response } from 'express';
import { Filter, UpdateFilter } from 'mongodb';
import { IndexableProperties } from '../../@types/indexableProperties';
import { Defaults } from '../../Config';
import { InviteEntity, OrgEntity, UserEntity } from '../../models';
import { findInTargetArray } from '../../utils';
import { collections, mongoClient } from '../../utils/connectToDatabase';

export const acceptInvite = async (req: Request, res: Response) => {
  const { inviteId } = req.params;
  const { user } = req;

  const { orgId } = user;

  if (orgId) {
    return res.status(403).json({
      message: `You already belong to an org: ${orgId} - delete it before joining another one!`,
    });
  }

  let invite: InviteEntity | undefined;

  const inviteFilter: Filter<InviteEntity> = {
    id: inviteId,
    $and: [
      { target: { property: IndexableProperties.User, value: user.id } },
      {
        // This is redundant but :)
        target: {
          property: IndexableProperties.Email,
          value: findInTargetArray(IndexableProperties.Email, user),
        },
      },
    ],
  };
  try {
    invite = (await collections.invites.findOne(inviteFilter)) as InviteEntity;
  } catch (error) {
    const msg = 'An error ocurred finding invite info';
    console.error(msg, error);
  }

  if (!invite) {
    return res.status(404).json({ message: 'Invite not found!' });
  }

  const { orgId: inviteOrgId } = invite;

  let deleteInvite = false;
  /**
   * Not sure how this would happen as we do a check before the invite is sent to prevent this...
   */
  if (inviteOrgId === orgId) {
    deleteInvite = true;
    res.status(400).json({ message: "It appears that you're already in this org!" });
  }

  const now = new Date();
  if (invite.expiresAt <= now && !deleteInvite) {
    // We need the delete invite check so we don't have two res.sends just in case
    deleteInvite = true;
    res.status(403).json({
      message: 'It looks like that invite has expired, ask the org admin to send you another one!',
    });
  }

  const session = mongoClient.startSession();

  let transactionResults;

  try {
    const { orgId } = invite;
    transactionResults = await session.withTransaction(async () => {
      await collections.invites.deleteOne(inviteFilter, { session });

      const userFilter: Filter<UserEntity> = {
        $and: [
          {
            id: user.id,
          },
          {
            target: {
              property: IndexableProperties.Org,
              value: null, // TODO update this
            },
          },
        ],
      };
      const userUpdate: UpdateFilter<UserEntity> = {
        $inc: { totalInvites: -1 },
        $set: {
          'target.$.value': orgId,
          orgJoinDate: now,
        },
      };

      await collections.users.updateOne(userFilter, userUpdate, { session });

      const orgFilter: Filter<OrgEntity> = {
        id: orgId,
      };

      const orgUpdate: UpdateFilter<OrgEntity> = {
        $inc: { totalUsers: 1 },
      };

      await collections.orgs.updateOne(orgFilter, orgUpdate, { session });
      await session.commitTransaction();
    });
  } catch (error) {
    const msg = 'An error ocurred accepting that invite';
    console.error(msg, error);
    return res.status(500).json({ message: msg });
  } finally {
    await session.endSession();
  }
  return res.status(200).json({ message: 'Invite accepted!' });
};
