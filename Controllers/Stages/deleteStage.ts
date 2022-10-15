import { Request, Response } from 'express';
import { Opening, Stage } from '../../entities';
import { IndexedEntities } from '../../types/main';
import { findInTargetArray } from '../../utils/findInTargetArray';

export const deleteStage = async (req: Request, res: Response) => {
  const { user, entityManager } = req;
  const { openingId, stageId } = req.params;
  const orgId = findInTargetArray({ entity: IndexedEntities.Org, targetArray: user.target });

  let opening: Opening;

  try {
    opening = await entityManager.findOne(Opening, {
      id: openingId,
      $and: [{ target: { id: orgId, type: IndexedEntities.Org } }],
    });
  } catch (error) {
    const message = 'An error ocurred finding opening info';
    console.error(message, error);
    return res.status(500).json({ message, error });
  }

  if (!opening) {
    return res.status(404).json({
      message: `Hmm... it appears that the opening with ID of '${openingId}' no longer exists`,
    });
  }

  let ourStage: Stage;

  try {
    ourStage = await entityManager.findOne(Stage, {
      id: stageId,
      $and: [
        { target: { id: orgId, type: IndexedEntities.Org } },
        { target: { id: opening.id, type: IndexedEntities.Opening } },
      ],
    });
  } catch (error) {
    const message = 'An error ocurred finding the stage info';
    console.error(message, error);
    return res.status(500).json({ message, error });
  }

  if (!ourStage) {
    return res.status(404).json({
      message: `Hmm... it appears that the stage with ID of '${stageId}' no longer exists`,
    });
  }

  const oldPreviousStageId = findInTargetArray({
    entity: IndexedEntities.PreviousStage,
    targetArray: ourStage.target,
  });

  const oldNextStageId = findInTargetArray({
    entity: IndexedEntities.NextStage,
    targetArray: ourStage.target,
  });

  let oldPreviousStage: Stage;
  let oldNextStage: Stage;

  // TODO these can be done in parallel
  if (oldPreviousStageId) {
    try {
      oldPreviousStage = await entityManager.findOne(Stage, {
        id: oldPreviousStageId,
        $and: [
          { target: { id: orgId, type: IndexedEntities.Org } },
          { target: { id: openingId, type: IndexedEntities.Opening } },
        ],
      });

      const oldPreviousStageNextStageIndex = oldPreviousStage.target.findIndex(
        (item) => item.type === IndexedEntities.NextStage,
      );

      if (oldNextStageId) {
        // Set the previous stage's next stage Id to be the stage that is being deleted's next stage Id
        oldPreviousStage.target[oldPreviousStageNextStageIndex] = {
          id: oldNextStageId,
          type: IndexedEntities.NextStage,
        };
      } else {
        oldPreviousStage.target[oldPreviousStageNextStageIndex] = {
          id: undefined,
          type: IndexedEntities.NextStage,
        };
      }

      entityManager.persist(oldPreviousStage);
    } catch (error) {
      const message = 'An error ocurred finding the previous stage info';
      console.error(message, error);
      return res.status(500).json({ message, error });
    }
  }

  if (oldNextStageId) {
    try {
      oldNextStage = await entityManager.findOne(Stage, {
        id: oldNextStageId,
        $and: [
          { target: { id: orgId, type: IndexedEntities.Org } },
          { target: { id: openingId, type: IndexedEntities.Opening } },
        ],
      });

      const oldNextStagePreviousStageIndex = oldNextStage.target.findIndex(
        (item) => item.type === IndexedEntities.PreviousStage,
      );

      if (oldPreviousStage) {
        // Set the next stage's previous stage Id to be the stage that is being deleted's previous stage Id
        oldNextStage.target[oldNextStagePreviousStageIndex] = {
          id: oldPreviousStageId,
          type: IndexedEntities.PreviousStage,
        };
      } else {
        oldNextStage.target[oldNextStagePreviousStageIndex] = {
          id: undefined,
          type: IndexedEntities.PreviousStage,
        };
      }

      entityManager.persist(oldNextStage);
    } catch (error) {
      const message = 'An error ocurred finding the previous stage info';
      console.error(message, error);
      return res.status(500).json({ message, error });
    }
  }

  entityManager.remove(ourStage);
  opening.totalStages - +opening.totalStages - 1;

  try {
    await entityManager.flush();
    return res.status(200).json({ message: 'Stage deleted!' });
  } catch (error) {
    const message = 'Error ocurred deleting stage';
    console.error(message, error);
    return res.status(500).json({ message, error });
  }
};
