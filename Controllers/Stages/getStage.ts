import { Request, Response } from 'express';
import { Stage } from '../../entities/Stage';

export const getStage = async (req: Request, res: Response) => {
  const { user } = req;
  const { openingId, stageId } = req.params;

  try {
    const stage = await Stage.findById(stageId, {
      org: user.org,
      openingId,
    });

    if (!stage) {
      return res.status(404).json({ message: 'Stage not found' });
    }
    return res.status(200).json(stage);
  } catch (error) {
    return res.status(500).json({ message: 'An error ocurred retrieving stage info' });
  }
};
