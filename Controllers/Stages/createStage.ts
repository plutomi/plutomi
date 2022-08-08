import { Request, Response } from 'express';
import Joi from 'joi';
import { JOI_SETTINGS, LIMITS } from '../../Config';
import * as CreateError from '../../utils/createError';
import { DynamoStage } from '../../types/dynamo';
import { DB } from '../../models';
import { Opening } from '../../entities/Opening';
import { Stage } from '../../entities/Stage';
import getNewChildItemOrder from '../../utils/getNewChildItemOrder';
import { Schema } from 'mongoose';

export interface APICreateStageOptions extends Required<Pick<DynamoStage, 'openingId' | 'GSI1SK'>> {
  /**
   * 0 based index on where the newly created stage should be placed
   */
  position?: number;
}
const schema = Joi.object({
  body: {
    // Stage name
    GSI1SK: Joi.string().max(LIMITS.MAX_STAGE_NAME_LENGTH),
    openingId: Joi.string(),
    /**
     * 0 based index on where should the stage be added
     * If no position is provided, stage is added to the end of the opening
     */
    position: Joi.number()
      .min(0)
      .max(LIMITS.MAX_CHILD_ITEM_LIMIT - 1),
  },
}).options(JOI_SETTINGS);

export const createStage = async (req: Request, res: Response) => {
  const { user } = req;
  try {
    await schema.validateAsync(req);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }

  const { GSI1SK, openingId, position } = req.body;

  try {
    const opening = await Opening.findOne(openingId, {
      org: user.org,
    });
    // TODO this should be a transaction
    // TODO create stage, and if position, insert it there

    // TODO increment totalStages on opening
    if (!opening) {
      return res.status(404).json({ message: 'Opening not found' });
    }

    try {
      const newStage = new Stage({
        org: user.org,
        openingId,
        name: GSI1SK, // TODO update this
      });

      await newStage.save();

      let newStageOrder: Schema.Types.ObjectId[] | undefined;

      if (position) {
        newStageOrder = getNewChildItemOrder(
          newStage._id,
          opening.stageOrder as unknown as Schema.Types.ObjectId[], // TODO fix types
          position,
        );
      }

      try {
        await Opening.updateOne(
          {
            _id: openingId,
            org: user.org,
          },
          {
            $inc: {
              totalStages: 1,
            },
          },
        );

        return res.status(201).json({ message: 'Stage created!' });
      } catch (error) {
        return res
          .status(500)
          .json({ message: 'An error ocurred updating the opening totalStages count' });
      }
    } catch (error) {
      return res.status(500).json({ message: 'An error ocurred creating that stage' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'An error ocurred retrieving opening info' });
  }
};
