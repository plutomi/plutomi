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
  extends Partial<Pick<DynamoStage, 'GSI1SK' | 'questionOrder'>> {}

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
    await entityManager.findOne(Stage, {
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
    return res.status(404).json({ message: 'Stage not found' });
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

      const oldPreviousStage = allStagesInOpening.find((stage) => stage.id === oldPreviousStageId);

      const oldPreviousStagesNextStageIndex = oldPreviousStage.target.findIndex(
        (item) => item.type === IndexedEntities.NextStage,
      );

      const oldNextStage = allStagesInOpening.find((stage) => stage.id === oldNextStageId);

      const oldNextStagesPreviousStageIndex = oldNextStage.target.findIndex(
        (item) => item.type === IndexedEntities.PreviousStage,
      );

      // Update the old previous stage
      if (oldPreviousStageId) {
        // Set our old previous stage's next stage to be our old next stage
        oldPreviousStage.target[oldPreviousStagesNextStageIndex] = stage.target.find(
          (item) => item.type === IndexedEntities.NextStage,
        );
      } else {
        oldPreviousStage.target[oldPreviousStagesNextStageIndex] = {
          id: undefined,
          type: IndexedEntities.NextStage,
        };
      }

      entityManager.persist(oldPreviousStage);

      if (oldNextStageId) {
        // Set our old next stage's previous stage to be our old previous stage

        oldNextStage.target[oldNextStagesPreviousStageIndex] = stage.target.find(
          (item) => item.type === IndexedEntities.PreviousStage,
        );
      } else {
        oldNextStage.target[oldNextStagesPreviousStageIndex] = {
          id: undefined,
          type: IndexedEntities.PreviousStage,
        };
      }

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

      // TODO update the old previous and next stages
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
