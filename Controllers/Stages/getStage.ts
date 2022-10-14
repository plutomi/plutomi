import { Request, Response } from 'express';
import { Stage } from '../../entities';
import { IndexedEntities } from '../../types/main';
import { findInTargetArray } from '../../utils/findInTargetArray';

export const getStage = async (req: Request, res: Response) => {
  const { user, entityManager } = req;
  const { openingId, stageId } = req.params;
  const orgId = findInTargetArray({ entity: IndexedEntities.Org, targetArray: user.target });

  let stage: Stage;

  try {
    stage = await entityManager.findOne(Stage, {
      id: stageId,
      $and: [
        {
          target: { id: orgId, type: IndexedEntities.Org },
        },
        {
          target: { id: openingId, type: IndexedEntities.Opening },
        },
      ],
    });
  } catch (error) {
    const message = 'An error ocurred retrieving stage info';
    console.error(message, error);
    return res.status(500).json({ message, error });
  }

  if (!stage) {
    return res.status(404).json({ message: 'Stage not found' });
  }

  return res.status(200).json(stage);
};
