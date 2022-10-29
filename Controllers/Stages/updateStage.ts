import { Request, Response } from 'express';
import Joi from 'joi';
import { Filter } from 'mongodb';
import { IndexableProperties } from '../../@types/indexableProperties';
import { JOI_SETTINGS, LIMITS } from '../../Config';
import { StageEntity } from '../../models';
import { collections, mongoClient } from '../../utils/connectToDatabase';
// import { DynamoStage } from '../../types/dynamo';
// import * as CreateError from '../../utils/createError';
// import { DB } from '../../models';
// import { Stage } from '../../entities';
// import { IndexedEntities } from '../../types/main';
import { findInTargetArray } from '../../utils/findInTargetArray';
import { getAdjacentStagesBasedOnPosition, sortStages } from '../../utils/sortStages';

//export interface APIUpdateStageOptions
//   extends Partial<Pick<DynamoStage, 'GSI1SK' | 'questionOrder'>> {
//   position?: number;
// }

const schema = Joi.object({
  questionOrder: Joi.array().items(Joi.string()),
  GSI1SK: Joi.string().max(LIMITS.MAX_STAGE_NAME_LENGTH),
}).options(JOI_SETTINGS);

export const updateStage = async (req: Request, res: Response) => {
  // try {
  //   await schema.validateAsync(req.body);
  // } catch (error) {
  //   const { status, body } = CreateError.JOI(error);
  //   return res.status(status).json(body);
  // }
  const { user } = req;
  const { openingId, stageId } = req.params;
  const orgId = findInTargetArray(IndexableProperties.Org, user);

  let stage: StageEntity | undefined;
  const stageFilter: Filter<StageEntity> = {
    $and: [
      {
        target: { property: IndexableProperties.Org, value: orgId },
      },
      {
        target: { property: IndexableProperties.Id, value: stageId },
      },
      {
        target: { property: IndexableProperties.Opening, value: openingId },
      },
    ],
  };
  try {
    stage = (await collections.stages.findOne(stageFilter)) as StageEntity;
  } catch (error) {
    const message = 'An error ocurred retrieving stage info';
    console.error(message, error);
    return res.status(500).json(message);
  }
  if (!stage) {
    return res.status(404).json({ message: 'Stage not found' });
  }
  // /** // TODO: Doubly Linked List!!!!!
  //  * If a user is attempting to update the order of the questions
  //  * but the length differs // TODO doubly linked list
  //  */
  // if (req.body.questionOrder) {
  //   if (req.body.questionOrder.length !== stage.questionOrder.length) {
  //     return res.status(403).json({
  //       message:
  //         'You cannot add / delete questions this way, please use the proper API methods for those actions',
  //     });
  //   }
  //   // Check if the IDs have been modified
  //   const containsAll = stage.questionOrder.every((questionId) =>
  //     req.body.questionOrder.includes(questionId),
  //   );
  //   if (!containsAll) {
  //     return res.status(400).json({
  //       message:
  //         "The questionIds in the 'questionOrder' property differ from the ones in the stage, please check your request and try again.",
  //     });
  //   }
  //   stage.questionOrder = req.body.questionOrder;
  // }

  const session = mongoClient.startSession();

  let transactionResults;
  try {
    transactionResults = await session.withTransaction(async () => {
      const updatedStageProperties: Partial<StageEntity> = {};
      // When moving, if these exist, we want to update them with new values
      const oldPreviousStageUpdate: Partial<StageEntity> = {};
      const oldNextStageUpdate: Partial<StageEntity> = {};
      const newPreviousStageUpdate: Partial<StageEntity> = {};
      const newNextStageUpdate: Partial<StageEntity> = {};

      if (req.body.GSI1SK) {
        updatedStageProperties.name = req.body.GSI1SK; // TODO update this type
      }

      if (req.body.position >= 0) {
        let unsortedStages: StageEntity[];
        const allStagesInOpeningFilter: Filter<StageEntity> = {
          $and: [
            { target: { property: IndexableProperties.Org, value: orgId } },
            { target: { property: IndexableProperties.Opening, value: openingId } },
          ],
        };

        unsortedStages = (await collections.stages
          .find(allStagesInOpeningFilter)
          .toArray()) as StageEntity[];

        // We must sort them first to be able to get the proper previous and next stage IDs
        const allStagesInOpening = sortStages(unsortedStages);

        /**
         * Whenever you see  findInTargetArray & findIndex checks, this is retrieving the pointer(s) for
         * the doubly linked list in that stage's `target` array
         *
         * Example:
         * target: [
         * { id: "nd19723jd298", type: "NextStage"},
         * { id: "nd19780247g", type: "PreviousStage"}
         *
         *
         * Along with other indexed properties such as the org and opening they are in
         * { id: "New York City", type: "Opening"}
         * { id: "Org", type: "Food Delivery App LLC"}
         * ]
         */
        const oldPreviousStageId = findInTargetArray(IndexableProperties.PreviousStage, stage);
        const oldNextStageId = findInTargetArray(IndexableProperties.NextStage, stage);

        let oldPreviousStage: StageEntity | undefined;
        let oldPreviousStagesNextStageIndex: number | null;
        let oldNextStage: StageEntity | undefined;
        let oldNextStagesPreviousStageIndex: number | null;
        let updateOldNextStage = false;
        let updateOldPreviousStage = false;

        // ! - First we need to update the old previous stage and old next stage if they exists

        // If there was a previous stage before we moved, we want to update that stage
        if (oldPreviousStageId) {
          oldPreviousStage = allStagesInOpening.find((stage) => {
            const stageId = findInTargetArray(IndexableProperties.Id, stage);
            if (stageId === oldPreviousStageId) return stage;
          });

          oldPreviousStagesNextStageIndex = oldPreviousStage.target.findIndex(
            (item) => item.property === IndexableProperties.NextStage,
          );
          /**
           * Set the old previous stage's nextStage to be the old next stage of the stage we are currently moving
           *
           *     OLD --- NEW
           * Stage 1 --- Stage 1 <-- Its next stage property gets updated to Stage 3, which was Stage 2's old next stage
           * Stage 2 --- Stage 3
           * Stage 3 --- Stage 2 <-- Moved
           */
          oldPreviousStageUpdate.target[oldPreviousStagesNextStageIndex] = stage.target.find(
            (item) => item.property === IndexableProperties.NextStage,
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
          oldNextStage = allStagesInOpening.find((stage) => {
            const stageId = findInTargetArray(IndexableProperties.Id, stage);
            if (stageId === oldNextStageId) return stage;
          });

          oldNextStagesPreviousStageIndex = oldNextStage.target.findIndex(
            (item) => item.property === IndexableProperties.PreviousStage,
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
          oldNextStageUpdate.target[oldNextStagesPreviousStageIndex] = stage.target.find(
            (item) => item.property === IndexableProperties.PreviousStage,
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
          oldPreviousStageUpdate.target[oldPreviousStagesNextStageIndex] = {
            property: IndexableProperties.NextStage,
            value: null,
          };
        }
        if (oldNextStage && updateOldNextStage) {
          oldNextStageUpdate.target[oldNextStagesPreviousStageIndex] = {
            property: IndexableProperties.PreviousStage,
            value: null,
          };
        }

        // Update the old stages

        const updateOldNextStageFilter: Filter<StageEntity> = {
          $and: [
            { target: { property: IndexableProperties.Org, value: orgId } },
            { target: { property: IndexableProperties.Opening, value: openingId } },
            { target: { property: IndexableProperties.Id, value: oldNextStageId } },
          ],
        };
        await collections.stages.updateOne(updateOldNextStageFilter, oldNextStageUpdate, {
          session,
        });

        const updateOldPreviousStageFilter: Filter<StageEntity> = {
          $and: [
            { target: { property: IndexableProperties.Org, value: orgId } },
            { target: { property: IndexableProperties.Opening, value: openingId } },
            { target: { property: IndexableProperties.Id, value: oldPreviousStageId } },
          ],
        };

        await collections.stages.updateOne(updateOldPreviousStageFilter, oldPreviousStageUpdate, {
          session,
        });

        // ! - Now we need to update the new previous stage and new next stage
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
          stageIdBeingMoved: stageId,
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
          (item) => item.property === IndexableProperties.NextStage,
        );
        if (newNextStageId) {
          updatedStageProperties.target[indexOfNextStage] = {
            property: IndexableProperties.NextStage,
            value: newNextStageId,
          };

          const newNextStage = allStagesInOpening.find((stage) => {
            const stageId = findInTargetArray(IndexableProperties.Id, stage);
            if (stageId === newNextStageId) return stage;
          });
          const nextStagePreviousStageIndex = newNextStage.target.findIndex(
            (item) => item.property === IndexableProperties.PreviousStage,
          );
          newNextStageUpdate.target[nextStagePreviousStageIndex] = {
            property: IndexableProperties.PreviousStage,
            value: stageId,
          };

          // TODO update many
          // Save our stage and the new next stage
          await collections.stages.updateOne(stageFilter, updatedStageProperties, { session });

          const updateNewNextStageFilter: Filter<StageEntity> = {
            $and: [
              { target: { property: IndexableProperties.Org, value: orgId } },
              { target: { property: IndexableProperties.Opening, value: openingId } },
              { target: { property: IndexableProperties.Id, value: newNextStageId } },
            ],
          };
          await collections.stages.updateOne(updateNewNextStageFilter, newNextStageUpdate, {
            session,
          });
        } else {
          // If there is no new next stage, our stage is being placed at the end. Next stage is therefore undefined!
          updatedStageProperties.target[indexOfNextStage] = {
            property: IndexableProperties.NextStage,
            value: null,
          };
          await collections.stages.updateOne(stageFilter, updatedStageProperties, { session });
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
          (item) => item.property === IndexableProperties.PreviousStage,
        );
        if (newPreviousStageId) {
          updatedStageProperties.target[indexOfPreviousStage] = {
            property: IndexableProperties.PreviousStage,
            value: newPreviousStageId,
          };
          const newPreviousStage = allStagesInOpening.find((stage) => {
            const stageId = findInTargetArray(IndexableProperties.Id, stage);
            if (stageId === newPreviousStageId) return stage;
          });

          const previousStageNextStageIndex = newPreviousStage.target.findIndex(
            (item) => item.property === IndexableProperties.NextStage,
          );

          newPreviousStageUpdate.target[previousStageNextStageIndex] = {
            property: IndexableProperties.NextStage,
            value: stageId,
          };

          const updateNewPreviousStageFilter: Filter<StageEntity> = {
            $and: [
              { target: { property: IndexableProperties.Org, value: orgId } },
              { target: { property: IndexableProperties.Opening, value: openingId } },
              { target: { property: IndexableProperties.Id, value: newPreviousStageId } },
            ],
          };
          // TODO update many
          await collections.stages.updateOne(updateNewPreviousStageFilter, newPreviousStageUpdate, {
            session,
          });
          await collections.stages.updateOne(stageFilter, updatedStageProperties, { session });
        } else {
          // If there is no new previous stage, our stage is therefore at the beginning and previous stage is undefined!
          updatedStageProperties.target[indexOfPreviousStage] = {
            property: IndexableProperties.PreviousStage,
            value: null,
          };

          await collections.stages.updateOne(stageFilter, updatedStageProperties, { session });
        }
        // End stage move
        await session.commitTransaction();
      }
    });
  } catch (error) {
    const msg = 'Error ocurred updating stage';
    console.error(msg, error);
    return res.status(500).json({ message: msg });
  } finally {
    await session.endSession();
  }

  return res.status(200).json({ message: 'Stage updated' });
};
