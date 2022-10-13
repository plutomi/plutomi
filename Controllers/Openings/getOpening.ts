import { Request, Response } from 'express';
import Joi from 'joi';
import { JOI_SETTINGS } from '../../Config';
import { Opening } from '../../entities';
import { DB } from '../../models';
import * as CreateError from '../../utils/createError';

const schema = Joi.object({
  params: {
    openingId: Joi.string(),
  },
}).options(JOI_SETTINGS);

export const getOpening = async (req: Request, res: Response) => {
  try {
    await schema.validateAsync(req);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }
  const { user, entityManager } = req;
  const { openingId } = req.params;

  let opening: Opening;

  try {
    opening = await entityManager.findOne(Opening, {
      org: user.org,
      id: openingId,
    });
  } catch (error) {
    const message = 'Error ocurred retrieving opening info';
    console.error(message, error);
    return res.status(500).json({ message, error });
  }

  if (!opening) {
    return res.status(404).json({ message: 'Opening not found' });
  }

  return res.status(200).json(opening);
};
