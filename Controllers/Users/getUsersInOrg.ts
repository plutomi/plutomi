import { Request, Response } from 'express';
import { pick } from 'lodash';
import { IdxTypes } from '../../types/main';
import * as CreateError from '../../utils/createError';
import { findInTargetArray } from '../../utils/findInTargetArray';

export const getUsersInOrg = async (req: Request, res: Response) => {
  const { user } = req;
  return res.status(200).json({ message: 'Endpoint temp disabled' });

  // const orgId = findInTargetArray({ entity: IdxTypes.Org, targetArray: user.target });

  // const [users, error] = await DB.Users.getUsersInOrg({
  //   orgId,
  // });

  // if (error) {
  //   const { status, body } = CreateError.SDK(
  //     error,
  //     'An error ocurred getting the users in your org',
  //   );

  //   return res.status(status).json(body);
  // }

  // const cleanUsers = users.map((user) =>
  //   pick(user, ['userId', 'orgId', 'firstName', 'lastName', 'email', 'orgJoinDate']),
  // );

  // return res.status(200).json(cleanUsers);
};
