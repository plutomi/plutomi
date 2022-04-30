import { Request, Response } from 'express';
import { JOI_SETTINGS, LIMITS } from '../../Config';
import * as CreateError from '../../utils/createError';
import * as Openings from '../../models/Openings';
import Joi from 'joi';
import { DynamoOpening } from '../../types/dynamo';
export type APICreateOpeningOptions = Required<Pick<DynamoOpening, 'openingName'>>;

const schema = Joi.object({
  body: {
    openingName: Joi.string().max(LIMITS.MAX_OPENING_NAME_LENGTH),
  },
}).options(JOI_SETTINGS);

const main = async (req: Request, res: Response) => {
  const { session } = res.locals;
  try {
    await schema.validateAsync(req);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }

  const { openingName }: APICreateOpeningOptions = req.body;

  const [created, createOpeningError] = await Openings.CreateOpening({
    orgId: session.orgId,
    openingName,
  });

  if (createOpeningError) {
    const { status, body } = CreateError.SDK(
      createOpeningError,
      'An error ocurred creating that opening',
    );
    return res.status(status).json(body);
  }

  return res.status(201).json({ message: 'Opening created!' });
};
export default main;
