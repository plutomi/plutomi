import { Request, Response } from 'express';
import Joi from 'joi';
import { JOI_SETTINGS, LIMITS, OpeningState } from '../../Config';
import { Filter, UpdateFilter } from 'mongodb';
import { findInTargetArray } from '../../utils/findInTargetArray';
import { OpeningEntity } from '../../models/Opening';
import { OrgEntity } from '../../models';
import { IndexableProperties } from '../../@types/indexableProperties';
import { collections, mongoClient } from '../../utils/connectToDatabase';
import { nanoid } from 'nanoid';
import { generateId } from '../../utils';

export type APICreateOpeningOptions = Required<Pick<OpeningEntity, 'name'>>;

const schema = Joi.object({
  body: {
    name: Joi.string().max(LIMITS.MAX_OPENING_NAME_LENGTH),
  },
}).options(JOI_SETTINGS);

export const createOpening = async (req: Request, res: Response) => {
  const { user } = req;
  try {
    await schema.validateAsync(req);
  } catch (error) {
    return res.status(400).json({ message: 'An error ocurred creating that opening', error });
  }

  const { name }: APICreateOpeningOptions = req.body;
  const { orgId } = user;

  const orgFilter: Filter<OrgEntity> = {
    id: orgId,
  };

  let transactionResults;

  const now = new Date();
  const newOpening: OpeningEntity = {
    id: generateId({}),
    orgId: orgId,
    name,
    totalApplicants: 0,
    totalStages: 0,
    createdAt: now,
    updatedAt: now,
    target: [
      // TODO allow creating public openings
      { property: IndexableProperties.OpeningState, value: OpeningState.Private },
    ],
  };

  const session = mongoClient.startSession();

  const orgUpdateFilter: UpdateFilter<OrgEntity> = {
    $inc: { totalOpenings: 1 },
  };

  try {
    transactionResults = await session.withTransaction(async () => {
      await collections.openings.insertOne(newOpening, { session });
      await collections.orgs.updateOne(orgFilter, orgUpdateFilter, { session });
      await session.commitTransaction();
    });
  } catch (error) {
    const message = 'An error ocurred creating that opening';
    console.error(message, error);
    return res.status(500).json({ message });
  } finally {
    await session.endSession();
  }

  return res.status(201).json({ message: 'Opening created!', opening: newOpening });
};
