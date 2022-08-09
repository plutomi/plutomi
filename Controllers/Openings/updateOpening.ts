import { Request, Response } from 'express';
import Joi from 'joi';
import * as CreateError from '../../utils/createError';
import { JOI_SETTINGS, OpeningState, LIMITS } from '../../Config';
import { DynamoOpening } from '../../types/dynamo';
import { Opening } from '../../entities/Opening';

const schema = Joi.object({
  stageOrder: Joi.array().items(Joi.string()),
  openingName: Joi.string().max(LIMITS.MAX_OPENING_NAME_LENGTH),
  GSI1SK: Joi.string().valid(OpeningState.PUBLIC, OpeningState.PRIVATE),
}).options(JOI_SETTINGS);

export interface APIUpdateOpeningOptions
  extends Partial<Pick<DynamoOpening, 'openingName' | 'GSI1SK' | 'stageOrder'>> {}

export const updateOpening = async (req: Request, res: Response) => {
  try {
    await schema.validateAsync(req.body);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }
  const { user } = req;
  const { openingId } = req.params;

  try {
    const opening = await Opening.findById(openingId, {
      org: user.org,
    });

    if (!opening) {
      return res.status(404).json({ message: 'Opening not found' });
    }

    if (req.body.stageOrder) {
      return res.status(403).json({
        message:
          'Updating stage order is currently blocked see https://github.com/plutomi/plutomi/issues/562',
      });
      // if (req.body.stageOrder.length !== opening.stageOrder.length) {
      //   return res.status(403).json({
      //     message:
      //       'You cannot add / delete stages this way, please use the proper API methods for those actions',
      //   });
      // }

      // Check if the IDs have been modified
      // // TODO add a test for this
      // const containsAll = opening.stageOrder.every((stageId) =>
      //   req.body.stageOrder.includes(stageId),
      // );

      // if (!containsAll) {
      //   return res.status(400).json({
      //     message:
      //       "The stageIds in the 'stageOrder' property differ from the ones in the opening, please check your request and try again.",
      //   });
      // }

      //   updatedValues.stageOrder = req.body.stageOrder;
    }
    // Public or private
    if (req.body.GSI1SK) {
      // TODO update property
      if (req.body.GSI1SK === OpeningState.PUBLIC && opening.totalStages === 0) {
        return res.status(403).json({
          message: 'An opening needs to have stages before being made public',
        });
      }

      opening.visibility = req.body.GSI1SK;
    }

    if (req.body.openingName) {
      opening.name = req.body.openingName;
    }

    try {
      await opening.save();
      return res.status(200).json({
        message: 'Opening updated!',
      });
    } catch (error) {
      return res.status(500).json({ message: 'An error ocurred updating that opening' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'An error ocurred finding that opening' });
  }
};
