import { Request, Response } from 'express';
import { Schema } from 'mongoose';
import { Opening } from '../../entities/Opening';
import { Stage } from '../../entities/Stage';
import { DB } from '../../models';
import * as CreateError from '../../utils/createError';
import getNewChildItemOrder from '../../utils/getNewChildItemOrder';

export const deleteStage = async (req: Request, res: Response) => {
  const { user } = req;
  const { openingId, stageId } = req.params;

  try {
    const opening = await Opening.findOne(openingId as unknown as Schema.Types.ObjectId, {
      org: user.org,
    });

    if (!opening) {
      return res.status(404).json({ message: 'Opening not found' });
    }

    // TODO remove stage from opening stage order

    // TODo decrement stage count on opening

    // MAJOR TODO, // TODO, if stage has questions, send to event bridge

    const indexToDelete = opening.stageOrder.indexOf(stageId as unknown as Schema.Types.ObjectId); // TODO types

    if (indexToDelete < 0) {
      return res.status(400).json({ message: 'Stage does not appear on opening' });
    }
    try {
      await Stage.deleteOne({
        _id: stageId,
        openingId,
        org: user.org,
      });

      const newStageOrder = opening.stageOrder.splice(indexToDelete, 1);
      try {
        await Opening.updateOne(openingId as unknown as Schema.Types.ObjectId, {
          // TODO types
          org: user.org,
        }),
          {
            $inc: {
              totalStages: -1,
            },
            $set: {
              stageOrder: newStageOrder,
            },
          };

        // TODO major async, if stage deleted and has questions, delete adjacent item!!!!!!!!!!!!!
      } catch (error) {
        return res
          .status(500)
          .json({ message: 'An error ocurred decrementing the stage count on the opening' });
      }
    } catch (error) {
      return res.status(500).json({ message: 'An error ocurred deleting stage from org' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'An error ocurred retrieving that opening' });
  }
};
