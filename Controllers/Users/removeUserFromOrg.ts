import { Request, Response } from 'express';
import { Filter, UpdateFilter } from 'mongodb';
import { IndexableProperties } from '../../@types/indexableProperties';
import { OrgEntity, UserEntity } from '../../models';
import { findInTargetArray } from '../../utils';
import { collections, mongoClient } from '../../utils/connectToDatabase';

export const removeUserFromOrg = async (req: Request, res: Response) => {
  const { user } = req;
  const { orgId, userId } = req.params;

  if (userId === user.id) {
    return res.status(403).json({
      message:
        "You cannot remove yourself from an org. If you're the only user, delete the org instead",
    });
  }

  let org: OrgEntity | undefined;

  try {
    const orgFilter: Filter<OrgEntity> = {
      id: orgId,
    };
    org = (await collections.orgs.findOne(orgFilter)) as OrgEntity;
  } catch (error) {
    const msg = 'An error ocurred retrieving org info';
    console.error(msg, error);
    return res.status(500).json({ message: msg });
  }

  if (!org) {
    return res.status(404).json({ message: `Org not found!` });
  }

  const session = mongoClient.startSession();

  let transactionResults;

  try {
    transactionResults = await session.withTransaction(async () => {
      const userFilter: Filter<UserEntity> = {
        id: userId,
        orgId,
      };
      const userUpdateFilter: UpdateFilter<UserEntity> = {
        $set: { orgId: null, orgJoinDate: null },
      };

      await collections.users.updateOne(userFilter, userUpdateFilter, { session });

      const orgFilter: Filter<OrgEntity> = {
        id: orgId,
      };
      const orgUpdateFilter: UpdateFilter<OrgEntity> = {
        $inc: { totalUsers: -1 },
      };

      await collections.orgs.updateOne(orgFilter, orgUpdateFilter, { session });
      await session.commitTransaction();
    });
  } catch (error) {
    const msg = 'Error ocurred removing user org';
    console.error(msg, error);
    return res.status(500).json({ message: msg });
  } finally {
    await session.endSession();
  }

  return res.status(200).json({ message: 'User removed' });
};
