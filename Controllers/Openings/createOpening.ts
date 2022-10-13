import { Request, Response } from 'express';
import Joi from 'joi';
import { JOI_SETTINGS, LIMITS } from '../../Config';
import * as CreateError from '../../utils/createError';
import { DynamoOpening } from '../../types/dynamo';
import { Opening } from '../../entities';

export type APICreateOpeningOptions = Required<Pick<DynamoOpening, 'openingName'>>;

const schema = Joi.object({
  body: {
    openingName: Joi.string().max(LIMITS.MAX_OPENING_NAME_LENGTH),
  },
}).options(JOI_SETTINGS);

export const createOpening = async (req: Request, res: Response) => {
  const { user, entityManager } = req;
  try {
    await schema.validateAsync(req);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }

  const { openingName }: APICreateOpeningOptions = req.body;

  const newOpening = new Opening({
    name: openingName,
    org: user.org,
  });

  try {
    await entityManager.persistAndFlush(newOpening);
  } catch (error) {
    console.error(`An error ocurred creating your opening`, error);
    return res.status(500).json({ message: 'An error ocurred creating your opening' });
  }

  return res.status(201).json({ message: 'Opening created!', opening: newOpening });
};
