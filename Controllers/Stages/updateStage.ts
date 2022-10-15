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
   * but the length differs
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

  if (req.body.position || req.body.position === 0) {
    let allStagesInOpening: Stage[];

    try {
      allStagesInOpening = await entityManager.find(Stage, {
        $and: [
          { target: { id: orgId, type: IndexedEntities.Org } },
          { target: { id: openingId, type: IndexedEntities.Opening } },
        ],
      });

      allStagesInOpening = sortStages(allStagesInOpening);

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

      // Update the old previous stage
      if (oldPreviousStageId) {
        // console.log(`\nThere is an old PREVIOUS stage ID`);
        oldPreviousStage = allStagesInOpening.find((stage) => stage.id === oldPreviousStageId);

        oldPreviousStagesNextStageIndex = oldPreviousStage.target.findIndex(
          (item) => item.type === IndexedEntities.NextStage,
        );

        // TODO this is if it moved more than two places. If our old next stage is now our previous, we need to set our oldPrevious stage's next stage
        // Set our old previous stage's next stage to be our old next stage
        oldPreviousStage.target[oldPreviousStagesNextStageIndex] = stage.target.find(
          (item) => item.type === IndexedEntities.NextStage,
        );
      } else {
        // console.log(`\nThere is NOT old PREVIOUS stage ID`);

        // Set our old next stage's previous stage to be undefined
        // We can't do it here because we don't know if it exists yet, and we can reuse the variables on lines 111
        updateOldNextStage = true;
      }

      // Update the old next stage's previous stage to be our old previous stage
      if (oldNextStageId) {
        // console.log(`\nThere is an old NEXT stage ID`);

        oldNextStage = allStagesInOpening.find((stage) => stage.id === oldNextStageId);

        oldNextStagesPreviousStageIndex = oldNextStage.target.findIndex(
          (item) => item.type === IndexedEntities.PreviousStage,
        );

        // Set our old next stage's previous stage to be our old previous stage

        oldNextStage.target[oldNextStagesPreviousStageIndex] = stage.target.find(
          (item) => item.type === IndexedEntities.PreviousStage,
        );
      } else {
        // console.log(`\nThere is NOT an old NEXT stage ID`);

        // Set or old previous stage's next stage to be undefined
        // We can't do it here because we don't know if it exists yet, and we can reuse the variables on lines 111
        updateOldPreviousStage = true;
      }

      // No next stage exists after the update
      if (oldPreviousStage && updateOldPreviousStage) {
        // console.log(
        //   `There is an old PREVIOUS stage ID and we need to update it's NEXT stage to undefined`,
        // );

        oldPreviousStage.target[oldPreviousStagesNextStageIndex] = {
          id: undefined,
          type: IndexedEntities.NextStage,
        };
      }

      // No previous stage exists after the update
      if (oldNextStage && updateOldNextStage) {
        // console.log(
        //   `There is an old NEXT stage ID and we need to update it's PREVIOUS stage to undefined`,
        // );
        oldNextStage.target[oldNextStagesPreviousStageIndex] = {
          id: undefined,
          type: IndexedEntities.PreviousStage,
        };
      }

      entityManager.persist(oldPreviousStage);
      entityManager.persist(oldNextStage);

      const { newNextStageId, newPreviousStageId } = getAdjacentStagesBasedOnPosition({
        position: req.body.position,
        otherSortedStages: allStagesInOpening,
        stageIdBeingMoved: stage.id,
      });

      // console.log(`\nNew previous stage id:`, newPreviousStageId);
      // console.log(`\nNew next stage id:`, newNextStageId);

      const indexOfNextStage = stage.target.findIndex(
        (item) => item.type === IndexedEntities.NextStage,
      );

      if (newNextStageId) {
        // console.log(`\nThere is an new NEXT stage ID`);

        stage.target[indexOfNextStage] = { id: newNextStageId, type: IndexedEntities.NextStage };

        // Update the next stage's previous stage id
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
        // console.log(`\nThere is NOT a new NEXT stage ID`);
        stage.target[indexOfNextStage] = { id: undefined, type: IndexedEntities.NextStage };
        entityManager.persist(stage);
      }

      const indexOfPreviousStage = stage.target.findIndex(
        (item) => item.type === IndexedEntities.PreviousStage,
      );

      if (newPreviousStageId) {
        // console.log(`\nThere is a new PREVIOUS stage ID`);

        // Update our stage's previous stage
        stage.target[indexOfPreviousStage] = {
          id: newPreviousStageId,
          type: IndexedEntities.PreviousStage,
        };

        // Update the new previous stage's next stage ID with our stage
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
        // console.log(`\nThere is NOT a new PREVIOUS stage ID`);

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
