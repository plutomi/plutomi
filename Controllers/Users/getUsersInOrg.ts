import { Request, Response } from 'express';
import { pick } from 'lodash';
import { Filter } from 'mongodb';
import { IndexableProperties } from '../../@types/indexableProperties';
import { UserEntity } from '../../models';
import { collections } from '../../utils/connectToDatabase';
import { findInTargetArray } from '../../utils/findInTargetArray';

export const getUsersInOrg = async (req: Request, res: Response) => {
  const { user } = req;

  const { orgId } = user;
  if (!orgId) {
    return res.status(200).json([]);
  }

  let usersInOrg: UserEntity[] | undefined;

  try {
    const usersFilter: Filter<UserEntity> = {
      target: { property: IndexableProperties.Org, value: orgId },
    };
    usersInOrg = (await collections.users.find(usersFilter).toArray()) as UserEntity[];
    const cleanUsers: Partial<UserEntity>[] = usersInOrg.map((user) => {
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
        email: findInTargetArray(IndexableProperties.Email, user),
        target: user.target,
        orgJoinDate: user.orgJoinDate,
      };
    });
    return res.status(200).json(cleanUsers);
  } catch (error) {
    const msg = 'An error ocurred retrieving users in your org';
    console.error(msg, error);
    return res.status(500).json({ message: msg });
  }
};
