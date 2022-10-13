import { Request, Response } from 'express';
import Joi from 'joi';
import * as CreateError from '../../utils/createError';
import { JOI_SETTINGS, OpeningState, LIMITS } from '../../Config';
import { Opening } from '../../entities';

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

  try {
    opening = await entityManager.findOne(Opening, {
      org: user.org,
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

  // TODO
  // if (req.body.stageOrder) {
  //   if (req.body.stageOrder.length !== opening.stageOrder.length) {
  //     return res.status(403).json({
  //       message:
  //         'You cannot add / delete stages this way, please use the proper API methods for those actions',
  //     });
  //   }

  //   // Check if the IDs have been modified
  //   // TODO add a test for this
  //   const containsAll = opening.stageOrder.every((stageId) =>
  //     req.body.stageOrder.includes(stageId),
  //   );

  //   if (!containsAll) {
  //     return res.status(400).json({
  //       message:
  //         "The stageIds in the 'stageOrder' property differ from the ones in the opening, please check your request and try again.",
  //     });
  //   }

  //   updatedValues.stageOrder = req.body.stageOrder;
  // }

  // TODO CHANGE THIS PROPERTY ON THE FE

  // Public or private
  if (req.body.GSI1SK) {
    // TODO i think this can be moved into dynamo
    if (req.body.GSI1SK === OpeningState.PUBLIC && opening.totalStages === 0) {
      return res.status(403).json({
        message: 'An opening needs to have stages before being made public',
      });
    }

    opening.state = req.body.GSI1SK;
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
