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

      console.log(`ALL STAGES IN OPENING`);
      allStagesInOpening.map((stage) =>
        console.log({
          name: stage.name,
          nextStage: stage.target.find((item) => item.type === IndexedEntities.NextStage),
          prevStage: stage.target.find((item) => item.type === IndexedEntities.PreviousStage),
        }),
      );

      allStagesInOpening = sortStages(allStagesInOpening);
      console.log(`ALL STAGES IN OPENING SORTED`);
      console.log(allStagesInOpening);
      
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
        console.log(`OLD PREVIOUS STAGE ID`, oldPreviousStageId);
        oldPreviousStage = allStagesInOpening.find((stage) => stage.id === oldPreviousStageId);
        console.log(`OLD PREVIOUS STAGE `, oldPreviousStage);

        oldPreviousStagesNextStageIndex = oldPreviousStage.target.findIndex(
          (item) => item.type === IndexedEntities.NextStage,
        );

        // Set our old previous stage's next stage to be our old next stage
        oldPreviousStage.target[oldPreviousStagesNextStageIndex] = stage.target.find(
          (item) => item.type === IndexedEntities.NextStage,
        );
      } else {
        // Set our old next stage's previous stage to be undefined
        // We can't do it here because we don't know if it exists yet, and we can reuse the variables on lines 111
        updateOldNextStage = true;
      }

      // Update the old next stage's previous stage to be our old previous stage
      if (oldNextStageId) {
        console.log(`OLD NEXT STAGE ID`, oldNextStageId);

        oldNextStage = allStagesInOpening.find((stage) => stage.id === oldNextStageId);

        console.log('OLD NEXT STAGE', oldNextStage);
        oldNextStagesPreviousStageIndex = oldNextStage.target.findIndex(
          (item) => item.type === IndexedEntities.PreviousStage,
        );

        // Set our old next stage's previous stage to be our old previous stage

        oldNextStage.target[oldNextStagesPreviousStageIndex] = stage.target.find(
          (item) => item.type === IndexedEntities.PreviousStage,
        );
      } else {
        // Set or old previous stage's next stage to be undefined
        // We can't do it here because we don't know if it exists yet, and we can reuse the variables on lines 111
        updateOldPreviousStage = true;
      }

      // No next stage exists after the update
      if (oldPreviousStage && updateOldPreviousStage) {
        oldPreviousStage.target[oldPreviousStagesNextStageIndex] = {
          id: undefined,
          type: IndexedEntities.NextStage,
        };
      }

      // No previous stage exists after the update
      if (oldNextStage && updateOldNextStage) {
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

      const indexOfNextStage = stage.target.findIndex(
        (item) => item.type === IndexedEntities.NextStage,
      );

      if (newNextStageId) {
        stage.target[indexOfNextStage] = { id: newNextStageId, type: IndexedEntities.NextStage };

        // Update the new previous stage
        const newNextStage = allStagesInOpening.find((stage) => stage.id === newNextStageId);

        const nextStagePreviousStageIndex = newNextStage.target.findIndex(
          (item) => item.type === IndexedEntities.PreviousStage,
        );

        newNextStage.target[nextStagePreviousStageIndex] = {
          id: stage.id,
          type: IndexedEntities.PreviousStage,
        };
        entityManager.persist(newNextStage);
      } else {
        stage.target[indexOfNextStage] = { id: undefined, type: IndexedEntities.NextStage };
        entityManager.persist(stage);
      }

      const indexOfPreviousStage = stage.target.findIndex(
        (item) => item.type === IndexedEntities.PreviousStage,
      );

      if (newPreviousStageId) {
        stage.target[indexOfPreviousStage] = {
          id: newNextStageId,
          type: IndexedEntities.NextStage,
        };

        // Update the new previous stage
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
        entityManager.persist(newPreviousStage);
      } else {
        stage.target[indexOfPreviousStage] = { id: undefined, type: IndexedEntities.NextStage };
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
