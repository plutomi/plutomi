import { Request, Response } from 'express';
import Joi from 'joi';
import { JOI_SETTINGS } from '../../Config';

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
    return res.status(400).json({ message: 'An error ocurred', error });
  }
  const { inviteId, userId } = req.body;

  return res.status(200).json({ message: 'TODO Endpoint temporarily disabled!' });

  // const [deleted, error] = await DB.Invites.deleteInvite({
  //   inviteId,
  //   userId,
  // });

  // if (error) {
  //   const { status, body } = CreateError.SDK(error, 'We were unable to cancel that invite');
  //   return res.status(status).json(body);
  // }

  // return res.status(200).json({ message: 'Invite cancelled!' });
};
