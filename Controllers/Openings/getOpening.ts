import { Request, Response } from 'express';
import Joi from 'joi';
import { Filter } from 'mongodb';
import { IndexableProperties } from '../../@types/indexableProperties';
import { JOI_SETTINGS } from '../../Config';
import { OpeningEntity } from '../../models/Opening';
import { collections } from '../../utils/connectToDatabase';
import * as CreateError from '../../utils/createError';
import { findInTargetArray } from '../../utils/findInTargetArray';

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
  const orgId = findInTargetArray(IndexableProperties.Org, user);
  let opening: OpeningEntity | undefined;

  const openingFilter: Filter<OpeningEntity> = {
    $and: [
      { target: { property: IndexableProperties.Org, value: orgId } },
      { target: { property: IndexableProperties.Id, value: openingId } },
    ],
  };
  try {
    opening = (await collections.openings.findOne(openingFilter)) as OpeningEntity;
  } catch (error) {
    const message = 'Error ocurred retrieving opening info';
    console.error(message, error);
    return res.status(500).json({ message });
  }

  if (!opening) {
    return res.status(404).json({ message: 'Opening not found' });
  }

  return res.status(200).json(opening);
};
