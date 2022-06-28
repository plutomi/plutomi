import { Request, Response } from 'express';
import { pick } from 'lodash';
import { DB } from '../../models';
import * as CreateError from '../../utils/createError';

export const getUsersInOrg = async (req: Request, res: Response) => {
  const { user } = req;

  const [users, error] = await DB.Users.getUsersInOrg({
    orgId: user.orgId,
  });

  if (error) {
    const { status, body } = CreateError.SDK(
      error,
      'An error ocurred getting the users in your org',
    );

    return res.status(status).json(body);
  }

  const cleanUsers = users.map((user) =>
    pick(user, ['userId', 'orgId', 'firstName', 'lastName', 'email', 'orgJoinDate']),
  );

  return res.status(200).json(cleanUsers);
};
