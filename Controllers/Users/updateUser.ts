import { Request, Response } from 'express';
import Joi from 'joi';
import * as CreateError from '../../utils/createError';
import { DEFAULTS, JOI_SETTINGS } from '../../Config';
import { DynamoUser } from '../../types/dynamo';
import { DB } from '../../models';
import { Schema } from 'mongoose';
import { User } from '../../entities/User';

export interface APIUpdateUserOptions extends Partial<Pick<DynamoUser, 'firstName' | 'lastName'>> {}

const schema = Joi.object({
  firstName: Joi.string().invalid(DEFAULTS.FIRST_NAME), // TODO set max length
  lastName: Joi.string().invalid(DEFAULTS.LAST_NAME), // TODO set max length
}).options(JOI_SETTINGS);

export const updateUser = async (req: Request, res: Response) => {
  try {
    await schema.validateAsync(req.body);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }

  let updatedValues: APIUpdateUserOptions = {};
  const { user } = req;

  // TODO RBAC will go here, right now you can only update yourself
  if ((req.params.userId as unknown as Schema.Types.ObjectId) !== user._id) {
    // TODO types
    return res.status(403).json({ message: 'You cannot update this user' });
  }

  const updatedUser = await User.findById(user._id);

  if (!updatedUser) {
    // Not sure how this would happen but whatever
    return res.status(404).json({ message: 'User not found' });
  }

  if (req.body.firstName) {
    updatedUser.firstName = req.body.firstName;
  }

  if (req.body.lastName) {
    updatedUser.lastName = req.body.lastName;
  }

  try {
    await updatedUser.save();
    // TODO RBAC is not implemented yet so this won't trigger

    return (
      res
        .status(200)
        // TODO types
        .json({
          message:
            (req.params.userId as unknown as Schema.Types.ObjectId) === user._id
              ? 'Info updated!'
              : 'User updated!',
        })
    );
  } catch (error) {
    return res.status(500).json({ message: 'An error ocurred updating user' });
  }
};
