import { Request, Response } from 'express';
import Joi from 'joi';
import { JOI_SETTINGS, OpeningState, LIMITS } from '../../Config';
import { findInTargetArray } from '../../utils/findInTargetArray';
import { OpeningEntity } from '../../models/Opening';
import { IndexableProperties } from '../../@types/indexableProperties';
import { collections } from '../../utils/connectToDatabase';
import { OrgEntity } from '../../models';
import { Filter, UpdateFilter } from 'mongodb';

const schema = Joi.object({
  stageOrder: Joi.array().items(Joi.string()),
  openingName: Joi.string().max(LIMITS.MAX_OPENING_NAME_LENGTH),
  GSI1SK: Joi.string().valid(OpeningState.Public, OpeningState.Private),
}).options(JOI_SETTINGS);

export const updateOpening = async (req: Request, res: Response) => {
  try {
    await schema.validateAsync(req.body);
  } catch (error) {
    return res.status(400).json({ message: 'An error ocurred', error });
  }
  const { user } = req;
  const { openingId } = req.params;

  let opening: OpeningEntity | undefined;

  const { orgId } = user;

  const openingFilter: Filter<OpeningEntity> = {
    id: openingId,
    orgId,
  };

  try {
    opening = (await collections.openings.findOne(openingFilter)) as OpeningEntity;
  } catch (error) {
    const message = 'An error ocurred retrieving opening info';
    console.error(message, error);
    return res.status(500).json({ message });
  }

  if (!opening) {
    return res.status(404).json({ message: 'Opening not found' });
  }

  const updateObject: Partial<OpeningEntity> = {};
  // Public or private
  if (req.body.GSI1SK) {
    // TODO better type
    if (req.body.GSI1SK === OpeningState.Public && opening.totalStages === 0) {
      return res.status(403).json({
        message: 'An opening needs to have stages before being made public',
      });
    }

    const indexOfOpeningState = opening.target.findIndex(
      (item) => item.property === IndexableProperties.OpeningState,
    );

    updateObject[`target.${indexOfOpeningState}.value`] = req.body.GSI1SK;
  }

  if (req.body.openingName) {
    updateObject.name = req.body.openingName;
  }

  try {
    await collections.openings.updateOne(openingFilter, {
      $set: updateObject,
    });
  } catch (error) {
    const message = 'Error updating opening';
    console.error(message, error);
    return res.status(500).json({ message });
  }

  return res.status(200).json({
    message: 'Opening updated!',
    opening,
  });
};
