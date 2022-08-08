import { Request, Response } from 'express';
import { Opening } from '../../entities/Opening';
import { Stage } from '../../entities/Stage';
import { DB } from '../../models';
import * as CreateError from '../../utils/createError';

export const getStagesInOpening = async (req: Request, res: Response) => {
  const { user } = req;
  const { openingId } = req.params;

  try {
    const opening = await Opening.findById(openingId, {
      org: user.org,
    });

    if (!opening) {
      return res.status(404).json({ message: 'Opening does not exist' });
    }

    if (!opening.stageOrder.length) {
      return res.status(200).json([]);
    }

    try {
      const allStages = await Promise.all(
        opening.stageOrder.map(
          async (stage) =>
            await Stage.findById(stage, {
              org: user.org,
              openingId: opening._id,
            }),
        ),
      );
      return res.status(200).json(allStages);
    } catch (error) {
      return res.status(500).json({ message: 'An error ocurred retrieving stage info' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'An error ocurred retrieving opening info' });
  }

};
