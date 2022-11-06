import { Request, Response } from 'express';
import Joi from 'joi';
import { Filter, UpdateFilter } from 'mongodb';
import { IndexableProperties } from '../../@types/indexableProperties';
import { JOI_SETTINGS } from '../../Config';
import { InviteEntity, UserEntity } from '../../models';
import { findInTargetArray } from '../../utils';
import { collections, mongoClient } from '../../utils/connectToDatabase';

const schema = Joi.object({
  body: {
    inviteId: Joi.string(),
    userId: Joi.string(),
  },
}).options(JOI_SETTINGS);
export const cancelInvite = async (req: Request, res: Response) => {
  // TODO only allow org admin
  try {
    await schema.validateAsync(req);
  } catch (error) {
    return res.status(400).json({ message: 'An error ocurred', error });
  }
  const { inviteId, orgId } = req.params;
  const { user } = req;

  const userOrgId = findInTargetArray(IndexableProperties.Org, user);

  if (userOrgId !== orgId) {
    return res.status(403).json({ message: 'You cannot delete that invite' });
  }

  let invite: InviteEntity | undefined;
  const inviteFilter: Filter<InviteEntity> = {
    id: inviteId,
    target: { property: IndexableProperties.Org, value: userOrgId },
  };

  try {
    invite = (await collections.invites.findOne(inviteFilter)) as InviteEntity;
  } catch (error) {
    const msg = 'An error ocurred retrieving that invite';
    console.error(msg, error);
    return res.status(500).json({ message: msg });
  }

  if (!invite) {
    return res.status(404).json({ message: 'Invite not found!' });
  }

  const session = mongoClient.startSession();
  let transactionResults;

  try {
    transactionResults = await session.withTransaction(async () => {
      await collections.invites.deleteOne(inviteFilter, { session });

      // TODO add session to other with transaction

      const userFilter: Filter<UserEntity> = {
        // This should be redundant but its a
        $or: [{ id: findInTargetArray(IndexableProperties.User, invite) }],
      };
      const userUpdate: UpdateFilter<UserEntity> = {
        $inc: { totalInvites: -1 },
      };
      await collections.users.updateOne(userFilter, userUpdate, { session });

      await session.commitTransaction();
    });
  } catch (error) {
    const msg = 'An error ocurred cancelling that invite';
    console.error(msg, error);
    return res.status(500).json({ message: msg });
  } finally {
    await session.endSession();
  }
  return res.status(200).json({ message: 'Invite cancelled!' });
};
