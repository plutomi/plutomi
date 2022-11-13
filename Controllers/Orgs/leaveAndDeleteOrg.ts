import { Request, Response } from 'express';
import { Filter, UpdateFilter } from 'mongodb';
import { IndexableProperties } from '../../@types/indexableProperties';
import { OrgEntity, UserEntity } from '../../models';
import { collections, mongoClient } from '../../utils/connectToDatabase';
import { findInTargetArray } from '../../utils/findInTargetArray';

export const leaveAndDeleteOrg = async (req: Request, res: Response) => {
  const { user } = req;

  const { orgId } = user;
  let org: OrgEntity | undefined;

  const orgFilter: Filter<OrgEntity> = {
    id: orgId,
  };
  try {
    org = (await collections.orgs.findOne(orgFilter)) as OrgEntity;
  } catch (error) {
    const message = `Error retrieving org info`;
    console.error(message, error);
    return res.status(500).json({ message, error });
  }

  if (!org) {
    return res.status(404).json({ message: 'Org not found' });
  }

  if (org.totalUsers > 1) {
    return res.status(403).json({
      message: 'You cannot delete this org as there are other users in it',
    });
  }

  let transactionResults;

  const userFilter: Filter<UserEntity> = {
    $and: [
      { id: user.id },
      {
        target: {
          property: IndexableProperties.Org,
          value: orgId,
        },
      },
    ],
  };
  const userUpdateFilter: UpdateFilter<UserEntity> = {
    $set: { 'target.$.value': null, orgJoinDate: null },
  };

  const session = mongoClient.startSession();
  try {
    transactionResults = await session.withTransaction(async () => {
      await collections.users.updateOne(userFilter, userUpdateFilter, {
        session,
      });

      await collections.orgs.deleteOne(orgFilter, { session });
      await session.commitTransaction();
    });
  } catch (error) {
    const msg = 'Error ocurred deleting org';
    console.error(msg, error);
    return res.status(500).json({ message: msg });
  } finally {
    await session.endSession();
  }

  return res.status(200).json({ message: 'Org deleted!' });
};
