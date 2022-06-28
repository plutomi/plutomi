import { Request, Response } from 'express';
import Joi from 'joi';
import { JOI_SETTINGS } from '../../Config';
import * as CreateError from '../../utils/createError';
import { DB } from '../../models';

const schema = Joi.object({
  body: {
    inviteId: Joi.string(),
    userId: Joi.string(),
  },
}).options(JOI_SETTINGS);
export const cancelInvite = async (req: Request, res: Response) => {
  try {
    await schema.validateAsync(req);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }
  const { inviteId, userId } = req.body;

  const [deleted, error] = await DB.Invites.deleteInvite({
    inviteId,
    userId,
  });

  if (error) {
    const { status, body } = CreateError.SDK(error, 'We were unable to cancel that invite');
    return res.status(status).json(body);
  }

  return res.status(200).json({ message: 'Invite cancelled!' });
};
