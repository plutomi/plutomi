import { Request, Response } from 'express';
import { Filter, UpdateFilter } from 'mongodb';
import { IndexableProperties } from '../../@types/indexableProperties';
import { OrgEntity, StageEntity, StageTargetArray } from '../../models';
import { OpeningEntity } from '../../models/Opening';
import { collections, mongoClient } from '../../utils/connectToDatabase';
// import { Opening, Stage } from '../../entities';
import { findInTargetArray } from '../../utils/findInTargetArray';

export const deleteStage = async (req: Request, res: Response) => {
  const { user } = req;
  const { openingId, stageId } = req.params;
  const orgId = findInTargetArray(IndexableProperties.Org, user);

  let opening: OpeningEntity;

  const openingFilter: Filter<OpeningEntity> = {
    $and: [
      { target: { property: IndexableProperties.Id, value: openingId } },
      { target: { property: IndexableProperties.Org, value: orgId } },
    ],
  };
  try {
    opening = (await collections.openings.findOne(openingFilter)) as OpeningEntity;
  } catch (error) {
    const message = 'An error ocurred finding opening info';
    console.error(message, error);
    return res.status(500).json(message);
  }

  if (!opening) {
    return res.status(404).json({
      message: `Hmm... it appears that the opening with ID of '${openingId}' no longer exists`,
    });
  }

  let ourStage: StageEntity;

  const stageFilter: Filter<StageEntity> = {
    $and: [
      { target: { property: IndexableProperties.Opening, value: openingId } },
      { target: { property: IndexableProperties.Org, value: orgId } },
      { target: { property: IndexableProperties.Id, value: stageId } },
    ],
  };
  try {
    ourStage = (await collections.stages.findOne(stageFilter)) as StageEntity;
  } catch (error) {
    const message = 'An error ocurred finding the stage info';
    console.error(message, error);
    return res.status(500).json(message);
  }

  if (!ourStage) {
    return res.status(404).json({
      message: `Hmm... it appears that the stage with ID of '${stageId}' no longer exists`,
    });
  }

  const oldPreviousStageId = findInTargetArray(IndexableProperties.Id, ourStage);
  const oldNextStageId = findInTargetArray(IndexableProperties.NextStage, ourStage);

  let oldPreviousStage: StageEntity;
  let oldNextStage: StageEntity;

  const session = mongoClient.startSession();

  let transactionResults;

  // TODO start transaction

  try {
    // TODO these can be done in parallel

    transactionResults = await session.withTransaction(async () => {
      // PART 1
      if (oldPreviousStageId) {
        const oldPreviousStageFilter: Filter<StageEntity> = {
          $and: [
            { target: { property: IndexableProperties.Opening, value: openingId } },
            { target: { property: IndexableProperties.Org, value: orgId } },
            { target: { property: IndexableProperties.Id, value: oldPreviousStageId } },
          ],
        };

        oldPreviousStage = (await collections.stages.findOne(oldPreviousStageFilter, {
          session,
        })) as StageEntity;

        const oldPreviousStageNextStageIndex = oldPreviousStage.target.findIndex(
          (item) => item.property === IndexableProperties.NextStage,
        );

        // TODO can these be more efficient? Just updating the specific item in the array

        if (oldNextStageId) {
          // Set the previous stage's next stage Id to be the stage that is being deleted's next stage Id
          oldPreviousStage.target[oldPreviousStageNextStageIndex] = {
            value: oldNextStageId,
            property: IndexableProperties.NextStage,
          };
        } else {
          // Set the old previous stage's next stage Id to be undefined
          oldPreviousStage.target[oldPreviousStageNextStageIndex] = {
            value: undefined,
            property: IndexableProperties.NextStage,
          };
        }

        await collections.stages.updateOne(
          oldPreviousStageFilter,
          {
            $set: {
              target: oldPreviousStage.target,
            },
          },
          { session },
        );
      }

      // PART 2

      if (oldNextStageId) {
        const oldNextStageFilter: Filter<StageEntity> = {
          $and: [
            { target: { property: IndexableProperties.Opening, value: openingId } },
            { target: { property: IndexableProperties.Org, value: orgId } },
            { target: { property: IndexableProperties.Id, value: oldNextStageId } },
          ],
        };

        oldNextStage = (await collections.stages.findOne(oldNextStageFilter, {
          session,
        })) as StageEntity;

        const oldNextStagePreviousStageIndex = oldNextStage.target.findIndex(
          (item) => item.property === IndexableProperties.PreviousStage,
        );

        if (oldPreviousStage) {
          // Set the next stage's previous stage Id to be the stage that is being deleted's previous stage Id
          oldNextStage.target[oldNextStagePreviousStageIndex] = {
            value: oldPreviousStageId,
            property: IndexableProperties.PreviousStage,
          };
        } else {
          oldNextStage.target[oldNextStagePreviousStageIndex] = {
            value: undefined,
            property: IndexableProperties.PreviousStage,
          };
        }

        await collections.stages.updateOne(
          oldNextStageFilter,
          {
            $set: {
              target: oldNextStage.target,
            },
          },
          { session },
        );

        // Decrement the totalStages count on the org

        const orgFilter: Filter<OrgEntity> = {
          $and: [{ target: { property: IndexableProperties.Id, value: orgId } }],
        };
        const orgUpdateFilter: UpdateFilter<OrgEntity> = {
          $inc: { totalStages: -1 },
        };
        await collections.orgs.updateOne(orgFilter, orgUpdateFilter, { session });

        // Decrement the totalStages count on the opening
        const openingUpdateFilter: UpdateFilter<OrgEntity> = {
          $inc: { totalStages: -1 },
        };
        await collections.openings.updateOne(openingFilter, openingUpdateFilter, { session });
        await session.commitTransaction();
      }
    });
  } catch (error) {
    const msg = 'Error ocurred deleting that stage';
    console.error(msg, error);
    return res.status(500).json({ message: msg });
  } finally {
    await session.endSession();
  }

  return res.status(200).json({ message: 'Stage deleted!' });
};
