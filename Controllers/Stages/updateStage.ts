import { Request, Response } from 'express';
import Joi from 'joi';
import { JOI_SETTINGS, LIMITS } from '../../Config';
import { DynamoStage } from '../../types/dynamo';
import * as CreateError from '../../utils/createError';
import { DB } from '../../models';
import { Stage } from '../../entities';
import { IndexedEntities } from '../../types/main';
import { findInTargetArray } from '../../utils/findInTargetArray';
import { getAdjacentStagesBasedOnPosition, sortStages } from '../../utils/sortStages';

export interface APIUpdateStageOptions
  extends Partial<Pick<DynamoStage, 'GSI1SK' | 'questionOrder'>> {
  position?: number;
}

const schema = Joi.object({
  questionOrder: Joi.array().items(Joi.string()),
  GSI1SK: Joi.string().max(LIMITS.MAX_STAGE_NAME_LENGTH),
}).options(JOI_SETTINGS);

export const updateStage = async (req: Request, res: Response) => {
  try {
    await schema.validateAsync(req.body);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }

  const { user, entityManager } = req;
  const { openingId, stageId } = req.params;

  const orgId = findInTargetArray({
    entity: IndexedEntities.Org,
    targetArray: user.target,
  });

  let stage: Stage;
  try {
    stage = await entityManager.findOne(Stage, {
      id: stageId,
      $and: [
        { target: { id: openingId, type: IndexedEntities.Opening } },
        { target: { id: orgId, type: IndexedEntities.Org } },
      ],
    });
  } catch (error) {
    const message = 'An error ocurred retrieving stage info';
    console.error(message, error);
    return res.status(500).json({ message, error });
  }

  if (!stage) {
    return res.status(404).json({ message: 'Stage not found while trying to update stage' });
  }

  /**
   * If a user is attempting to update the order of the questions
   * but the length differs // TODO doubly linked list
   */
  if (req.body.questionOrder) {
    if (req.body.questionOrder.length !== stage.questionOrder.length) {
      return res.status(403).json({
        message:
          'You cannot add / delete questions this way, please use the proper API methods for those actions',
      });
    }

    // Check if the IDs have been modified
    const containsAll = stage.questionOrder.every((questionId) =>
      req.body.questionOrder.includes(questionId),
    );

    if (!containsAll) {
      return res.status(400).json({
        message:
          "The questionIds in the 'questionOrder' property differ from the ones in the stage, please check your request and try again.",
      });
    }

    stage.questionOrder = req.body.questionOrder;
  }

  if (req.body.GSI1SK) {
    stage.name = req.body.GSI1SK;
  }

  if (req.body.position >= 0) {
    let allStagesInOpening: Stage[];

    try {
      allStagesInOpening = await entityManager.find(Stage, {
        $and: [
          { target: { id: orgId, type: IndexedEntities.Org } },
          { target: { id: openingId, type: IndexedEntities.Opening } },
        ],
      });

      // We must sort it first to be able to get the proper previous and next stage IDs
      allStagesInOpening = sortStages(allStagesInOpening);

      /**
       * Whenever you see  findInTargetArray & findIndex checks, this is retrieving the pointer(s) for
       * the doubly linked list in that stage's `target` array
       *
       * Example:
       *
       * target: [
       * { id: "nd19723jd298", type: "NextStage"},
       * { id: "nd19780247g", type: "PreviousStage"}
       *
       * Along with other indexed properties such as the org and opening they are in
       *
       * { id: "New York City", type: "Opening"}
       * { id: "Org", type: "Food Delivery App LLC"}
       * ]
       */

      const oldPreviousStageId = findInTargetArray({
        entity: IndexedEntities.PreviousStage,
        targetArray: stage.target,
      });

      const oldNextStageId = findInTargetArray({
        entity: IndexedEntities.NextStage,
        targetArray: stage.target,
      });

      let oldPreviousStage: Stage | undefined;
      let oldPreviousStagesNextStageIndex: number | undefined;
      let oldNextStage: Stage | undefined;
      let oldNextStagesPreviousStageIndex: number | undefined;

      let updateOldNextStage = false;
      let updateOldPreviousStage = false;

      // If there was a previous stage before we moved, we want to update that stage
      if (oldPreviousStageId) {
        oldPreviousStage = allStagesInOpening.find((stage) => stage.id === oldPreviousStageId);

        oldPreviousStagesNextStageIndex = oldPreviousStage.target.findIndex(
          (item) => item.type === IndexedEntities.NextStage,
        );

        /**
         * Set the old previous stage's nextStage to be the old next stage of the stage we are currently moving
         *
         *     OLD --- NEW
         * Stage 1 --- Stage 1 <-- Its next stage property gets updated to Stage 3, which was Stage 2's old next stage
         * Stage 2 --- Stage 3
         * Stage 3 --- Stage 2 <-- Moved
         */
        oldPreviousStage.target[oldPreviousStagesNextStageIndex] = stage.target.find(
          (item) => item.type === IndexedEntities.NextStage,
        );
      } else {
        /**
         * Set our old next stage's previous stage to be undefined.
    
         *
         *     OLD --- NEW
         * Stage 1 --- Stage 2 <-- Previous stage is now undefined
         * Stage 2 --- Stage 1 <-- Moved
         *
         *
         * We can't do the update here because we don't know if that next stage exists yet - we are doing that down below so...
         * to prevent duplicate checks for that next stage, we are setting a reminder for us to update that stage later once we verified that it exists
         */
        updateOldNextStage = true;
      }

      // If there was a next stage before we moved, we need to update that stage's previous stage
      if (oldNextStageId) {
        oldNextStage = allStagesInOpening.find((stage) => stage.id === oldNextStageId);

        oldNextStagesPreviousStageIndex = oldNextStage.target.findIndex(
          (item) => item.type === IndexedEntities.PreviousStage,
        );

        /**
         * We need to set Stage 2's previous stage to our stage's old previous stage
         *
         *     OLD --- NEW
         * Stage 1 --- Stage 2 <-- Previous stage gets updated to undefined
         * Stage 2 --- Stage 3
         * Stage 3 --- Stage 1 <--- Moved
         *
         */
        oldNextStage.target[oldNextStagesPreviousStageIndex] = stage.target.find(
          (item) => item.type === IndexedEntities.PreviousStage,
        );
      } else {
        /**
         *  If there is no old next stage, we need to update our old previous stage's next stage ID to be undefined.
         *
         * OLD --- NEW
         *
         * Stage 1 --- Stage 2 <-- Moved
         * Stage 2 --- Stage 1 <-- Needs their next stage to be undefined
         *
         *
         * Same case as above, we don't really know if we had a previous check, this logic statement is not responsible for that.
         * We are setting a reminder for us to check it a little bit below to prevent duplicate logic
         */
        updateOldPreviousStage = true;
      }

      // Update the relevant stages if needed (the two else checks above)
      if (oldPreviousStage && updateOldPreviousStage) {
        oldPreviousStage.target[oldPreviousStagesNextStageIndex] = {
          id: undefined,
          type: IndexedEntities.NextStage,
        };
      }

      if (oldNextStage && updateOldNextStage) {
        oldNextStage.target[oldNextStagesPreviousStageIndex] = {
          id: undefined,
          type: IndexedEntities.PreviousStage,
        };
      }

      // Queue them up to be saved into the DB
      entityManager.persist(oldPreviousStage);
      entityManager.persist(oldNextStage);

      /**
       * Now we move on to update the new stages after moving our stage to its desired spot. Note that these stages can be a combination of the "old" stages.. Example:
       *
       * OLD --- NEW
       *
       * Stage 1 --- Stage 2 <-- Its old previous stage is now its new next stage, and its previous stage is now undefined!
       * Stage 2 --- Stage 1 <-- Moved, its old next stage is now its new previous stage!
       * Stage 3 --- Stage 3
       *
       * The function below retrieves the IDs of the new stages from the current state of the stages
       */
      const { newNextStageId, newPreviousStageId } = getAdjacentStagesBasedOnPosition({
        position: req.body.position,
        otherSortedStages: allStagesInOpening,
        stageIdBeingMoved: stage.id,
      });

      /**
       * If there is a new next stage, we want to:
       *
       * 1. Update our stage's next stage to be that stage's id
       * 2. Update that new next stage's previous stage to be our stage
       *
       * OLD --- NEW
       *
       * Stage 1 --- Stage 2
       * Stage 2 --- Stage 1 <-- Moved, needs it's next stage updated
       * Stage 3 --- Stage 3 <-- Previous stage needs updating to be our stage
       */

      const indexOfNextStage = stage.target.findIndex(
        (item) => item.type === IndexedEntities.NextStage,
      );

      if (newNextStageId) {
        stage.target[indexOfNextStage] = { id: newNextStageId, type: IndexedEntities.NextStage };

        const newNextStage = allStagesInOpening.find((stage) => stage.id === newNextStageId);

        const nextStagePreviousStageIndex = newNextStage.target.findIndex(
          (item) => item.type === IndexedEntities.PreviousStage,
        );

        newNextStage.target[nextStagePreviousStageIndex] = {
          id: stage.id,
          type: IndexedEntities.PreviousStage,
        };
        entityManager.persist(stage);
        entityManager.persist(newNextStage);
      } else {
        // If there is no new next stage, our stage is being placed at the end. Next stage is therefore undefined!
        stage.target[indexOfNextStage] = { id: undefined, type: IndexedEntities.NextStage };
        entityManager.persist(stage);
      }

      /**
       * If there is a new previous stage, we want to:
       *
       * 1. Update our stage's previous stage to be that stage's next id
       * 2. Update that new previous stage's next stage to be our stage
       *
       * OLD --- NEW
       *
       * Stage 1 --- Stage 2 <-- Next stage needs updating to be our stage
       * Stage 2 --- Stage 1 <-- Moved, needs it's previous stage updated
       * Stage 3 --- Stage 3
       */

      const indexOfPreviousStage = stage.target.findIndex(
        (item) => item.type === IndexedEntities.PreviousStage,
      );

      if (newPreviousStageId) {
        stage.target[indexOfPreviousStage] = {
          id: newPreviousStageId,
          type: IndexedEntities.PreviousStage,
        };

        const newPreviousStage = allStagesInOpening.find(
          (stage) => stage.id === newPreviousStageId,
        );
        const previousStageNextStageIndex = newPreviousStage.target.findIndex(
          (item) => item.type === IndexedEntities.NextStage,
        );

        newPreviousStage.target[previousStageNextStageIndex] = {
          id: stage.id,
          type: IndexedEntities.NextStage,
        };
        entityManager.persist(stage);
        entityManager.persist(newPreviousStage);
      } else {
        // If there is no previous stage, our stage is therefore at the beginning and previous stage is undefined!
        stage.target[indexOfPreviousStage] = { id: undefined, type: IndexedEntities.PreviousStage };
        entityManager.persist(stage);
      }

      try {
        await entityManager.flush();
        return res.status(200).json({ message: 'Stages updated!' });
      } catch (error) {
        const message = 'Error updating stage order';
        console.error(message, error);
        return res.status(500).json({ message, error });
      }
    } catch (error) {
      const message = 'Error retrieving other stages in opening';
      console.error(message, error);
      return res.status(500).json({ message, error });
    }
  }

  try {
    return res.status(200).json({ message: 'Stage updated', stage });
  } catch (error) {
    const message = 'An error ocurred updating that stage';
    console.error(error, message);
    return res.status(500).json({ message, error });
  }
};
