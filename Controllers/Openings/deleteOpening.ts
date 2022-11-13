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

export type APICreateOpeningOptions = Required<Pick<OpeningEntity, 'name'>>;

const schema = Joi.object({
  body: {
    openingName: Joi.string().max(LIMITS.MAX_OPENING_NAME_LENGTH),
  },
}).options(JOI_SETTINGS);

export const deleteOpening = async (req: Request, res: Response) => {
  const { user } = req;
  try {
    await schema.validateAsync(req);
  } catch (error) {
    return res.status(400).json({ message: 'An error ocurred', error });
  }

  const { openingId } = req.params;
  const { orgId } = user;
  const openingFilter: Filter<OpeningEntity> = {
    id: openingId,
    // TODO add org id
    target: { property: IndexableProperties.Org, value: orgId },
  };

  let openingToBeDeleted: OpeningEntity | undefined;

  try {
    openingToBeDeleted = (await collections.openings.findOne(openingFilter)) as OpeningEntity;
  } catch (error) {
    const message = `Unable to find opening info`;
    console.error(message, error);
    return res.status(500).json(message);
  }

  if (!openingToBeDeleted) {
    return res.status(404).json({ message: 'Opening not found' });
  }
  const orgFilter: Filter<OrgEntity> = {
    id: orgId,
  };

  let transactionResults;

  const session = mongoClient.startSession();

  const orgUpdateFilter: UpdateFilter<OrgEntity> = {
    $inc: { totalOpenings: -1 },
  };

  try {
    transactionResults = await session.withTransaction(async () => {
      await collections.openings.deleteOne(openingFilter, { session });
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

  return res.status(201).json({ message: 'Opening deleted!' });
};
