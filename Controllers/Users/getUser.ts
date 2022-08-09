import { Request, Response } from 'express';
import Joi from 'joi';
import { Schema } from 'mongoose';
import { JOI_SETTINGS } from '../../Config';
import { User } from '../../entities/User';
import * as CreateError from '../../utils/createError';

interface APIGetUserByIdParameters {
  userId?: string;
}

const schema = Joi.object({
  params: {
    userId: Joi.string(),
  },
}).options(JOI_SETTINGS);

export const getUser = async (req: Request, res: Response) => {
  const { user } = req;
  try {
    await schema.validateAsync(req);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }

  const { userId }: APIGetUserByIdParameters = req.params;
  if ((user._id as unknown as string) !== userId) {
    // TODO types
    // TODO RBAC
    // TODO 404?
    return res.status(403).json({
      message: 'You are not authorized to view this user',
    });
  }

  try {
    const requestedUser = await User.findOne(userId as unknown as Schema.Types.ObjectId);

    if (!requestedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // TODO RBAC here
    // Only allow viewing users in the same org
    if (user.org !== requestedUser.org) {
      return res.status(403).json({
        message: 'You are not authorized to view this user since you are not in the same org',
      });
    }

    return res.status(200).json(requestedUser);
  } catch (error) {
    return res.status(500).json({ message: 'An error ocurred retrieving user info' });
  }
};
