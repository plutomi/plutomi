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

export const getOpeningsInOrg = async (req: Request, res: Response) => {
  try {
    await schema.validateAsync(req);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }

  const { user } = req;
  const orgId = findInTargetArray(IndexableProperties.Org, user);
  let openings: OpeningEntity[] | undefined;

  const openingsFilter: Filter<OpeningEntity> = {
    target: { property: IndexableProperties.Org, value: orgId },
  };
  try {
    openings = (await collections.openings.find(openingsFilter).toArray()) as OpeningEntity[];
  } catch (error) {
    const message = 'Error ocurred retrieving openings';
    console.error(message, error);
    return res.status(500).json({ message });
  }

  return res.status(200).json(openings);
};
