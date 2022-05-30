import { Request, Response } from 'express';
import Joi from 'joi';
import { JOI_SETTINGS } from '../../../Config';
import { getOpening } from '../../../models/Openings';
import * as CreateError from '../../../utils/createError';

const schema = Joi.object({
  params: {
    openingId: Joi.string(),
  },
}).options(JOI_SETTINGS);

export const main = async (req: Request, res: Response) => {
  try {
    await schema.validateAsync(req);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }
  const { session } = res.locals;
  const { openingId } = req.params;

  const [opening, error] = await getOpening({
    openingId,
    orgId: session.orgId,
  });

  if (error) {
    const { status, body } = CreateError.SDK(error, 'An error ocurred retrieving your opening');
    return res.status(status).json(body);
  }
  if (!opening) {
    return res.status(404).json({ message: 'Opening not found' });
  }

  return res.status(200).json(opening);
};
