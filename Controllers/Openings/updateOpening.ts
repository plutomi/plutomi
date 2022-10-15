import { Request, Response } from 'express';
import Joi from 'joi';
import * as CreateError from '../../utils/createError';
import { JOI_SETTINGS, OpeningState, LIMITS } from '../../Config';
import { Opening } from '../../entities';
import { findInTargetArray } from '../../utils/findInTargetArray';
import { IndexedEntities } from '../../types/main';

const schema = Joi.object({
  stageOrder: Joi.array().items(Joi.string()),
  openingName: Joi.string().max(LIMITS.MAX_OPENING_NAME_LENGTH),
  GSI1SK: Joi.string().valid(OpeningState.PUBLIC, OpeningState.PRIVATE),
}).options(JOI_SETTINGS);

export const updateOpening = async (req: Request, res: Response) => {
  try {
    await schema.validateAsync(req.body);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }
  const { user, entityManager } = req;
  const { openingId } = req.params;

  let opening: Opening;
  const orgId = findInTargetArray({ entity: IndexedEntities.Org, targetArray: user.target });
  try {
    opening = await entityManager.findOne(Opening, {
      target: { id: orgId, type: IndexedEntities.Org },
      id: openingId,
    });
  } catch (error) {
    const message = 'Error ocurred retrieving opening info';
    console.error(message, error);
    return res.status(500).json({ message, error });
  }

  if (!opening) {
    return res.status(404).json({ message: 'Opening not found' });
  }

  // Public or private
  if (req.body.GSI1SK) {
    // TODO i think this can be moved into dynamo
    if (req.body.GSI1SK === OpeningState.PUBLIC && opening.totalStages === 0) {
      return res.status(403).json({
        message: 'An opening needs to have stages before being made public',
      });
    }

    opening.target = opening.target.map((item) => {
      if (item.type === IndexedEntities.OpeningState) {
        item.id = req.body.GSI1SK;
      }
      return item;
    });
  }

  // TODO update this
  if (req.body.openingName) {
    opening.name = req.body.openingName;
  }

  try {
    await entityManager.persistAndFlush(opening);
  } catch (error) {
    const message = 'Error updating opening';
    console.error(message, error);
    return res.status(500).json({ message, error });
  }

  return res.status(200).json({
    message: 'Opening updated!',
    opening,
  });
};
