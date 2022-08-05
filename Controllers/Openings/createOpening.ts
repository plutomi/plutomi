import { Request, Response } from 'express';
import Joi from 'joi';
import { JOI_SETTINGS, LIMITS } from '../../Config';
import * as CreateError from '../../utils/createError';
import { DynamoOpening } from '../../types/dynamo';
import { DB } from '../../models';
import { Opening } from '../../entities/Opening';
import { Org } from '../../entities/Org';

export type APICreateOpeningOptions = Required<Pick<DynamoOpening, 'openingName'>>;

const schema = Joi.object({
  body: {
    openingName: Joi.string().max(LIMITS.MAX_OPENING_NAME_LENGTH),
  },
}).options(JOI_SETTINGS);

export const createOpening = async (req: Request, res: Response) => {
  const { user } = req;
  try {
    await schema.validateAsync(req);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }

  const { openingName }: APICreateOpeningOptions = req.body;

  // TODO needs to be a transaction
  try {
    const newOpening = new Opening({
      name: openingName,
      orgId: user.org,
    });

    await newOpening.save();

    try {
      await Org.updateOne(
        {
          _id: user.org,
        },
        {
          $inc: {
            totalOpenings: 1,
          },
        },
      );
      return res.status(200).json({ message: 'Opening created' });
    } catch (error) {
      return res.status(500).json({ message: 'An error ocurred incrementing openings in the org' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error creating opening!' });
  }
};
