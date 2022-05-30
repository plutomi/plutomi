import { Request, Response } from 'express';
import Joi from 'joi';
import * as CreateError from '../../utils/createError';
import { DEFAULTS, JOI_GLOBAL_FORBIDDEN, JOI_SETTINGS } from '../../Config';
import { DynamoUser } from '../../types/dynamo';
import DB from '../../models';

export interface APIUpdateUserOptions extends Partial<Pick<DynamoUser, 'firstName' | 'lastName'>> {
  [key: string]: any;
}
/**
 * When calling PUT /users/:userId, these properties cannot be updated by the user
 *  TODO use new update pattern https://github.com/plutomi/plutomi/issues/594
 */
export const JOI_FORBIDDEN_USER = {
  ...JOI_GLOBAL_FORBIDDEN,
  userId: Joi.any().forbidden(),
  userRole: Joi.any().forbidden(), // TODO rbac
  orgJoinDate: Joi.any().forbidden(),
  canReceiveEmails: Joi.any().forbidden(),
  GSI1PK: Joi.any().forbidden(), // Org users
  firstName: Joi.string().invalid(DEFAULTS.FIRST_NAME).optional(), // TODO set max length
  lastName: Joi.string().invalid(DEFAULTS.LAST_NAME).optional(), // TODO set max length
  unsubscribeKey: Joi.any().forbidden(),
  GSI2PK: Joi.any().forbidden(), // Email
  GSI2SK: Joi.any().forbidden(), // Entity type
  totalInvites: Joi.any().forbidden(),
  verifiedEmail: Joi.any().forbidden(), // Updated asynchronously (step functions) on 1st login
};

const schema = Joi.object({
  params: {
    userId: Joi.string(),
  },
  body: JOI_FORBIDDEN_USER,
}).options(JOI_SETTINGS);

export const main = async (req: Request, res: Response) => {
  try {
    await schema.validateAsync(req);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }

  const { session } = res.locals;
  const { userId } = req.params;

  // TODO RBAC will go here, right now you can only update yourself
  if (userId !== session.userId) {
    return res.status(403).json({ message: 'You cannot update this user' });
  }

  const [updatedUser, error] = await DB.Users.updateUser({
    userId: session.userId,
    newValues: req.body,
  });

  if (error) {
    const { status, body } = CreateError.SDK(error, 'An error ocurred updating user info');
    return res.status(status).json(body);
  }

  return res.status(200).json({
    // TODO RBAC is not implemented yet so this won't trigger
    message: userId === session.userId ? 'Info updated!' : 'User updated!',
  });
};
