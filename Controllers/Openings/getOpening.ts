import { Request, Response } from 'express';
import Joi from 'joi';
import { JOI_SETTINGS } from '../../Config';
import { Opening } from '../../entities/Opening';
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
  const { user } = req;
  const { openingId } = req.params;

  try {
    const opening = await Opening.findById(openingId);

    if (!opening) {
      return res.status(404).json({ message: 'Opening not found' });
    }

    return res.status(200).json(opening);
  } catch (error) {
    return res.status(200).json({ message: 'An error ocurred retrieving opening' });
  }
};
