import { Request, Response } from 'express';
import { Filter } from 'mongodb';
import { IndexableProperties } from '../../@types/indexableProperties';
import { StageEntity, StageTargetArray } from '../../models';
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

  let oldPreviousStageNextStageIndex: number;

  const session = mongoClient.startSession();

  let transactionResults;

  try {
    // TODO these can be done in parallel
    if (oldPreviousStageId) {
      const oldPreviousStageFilter: Filter<StageEntity> = {
        $and: [
          { target: { property: IndexableProperties.Opening, value: openingId } },
          { target: { property: IndexableProperties.Org, value: orgId } },
          { target: { property: IndexableProperties.Id, value: oldPreviousStageId } },
        ],
      };
      try {
        oldPreviousStage = (await collections.stages.findOne(
          oldPreviousStageFilter,
        )) as StageEntity;

        const oldPreviousStageNextStageIndex = oldPreviousStage.target.findIndex(
          (item) => item.property === IndexableProperties.NextStage,
        );

        let newTargetArray: StageTargetArray = oldPreviousStage.target;

        if (oldNextStageId) {
          // Set the previous stage's next stage Id to be the stage that is being deleted's next stage Id
          oldPreviousStage.target[oldPreviousStageNextStageIndex] = {
            value: oldNextStageId,
            property: IndexableProperties.NextStage,
          };
        } else {
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
      } catch (error) {
        const message = 'An error ocurred finding the previous stage info';
        console.error(message, error);
        return res.status(500).json({ message, error });
      }
    }

    await session.commitTransaction();
  } catch (error) {
    const msg = 'Error ocurred deleting that stage';
    console.error(msg, error);
    return res.status(500).json({ message: msg });
  } finally {
    await session.endSession();
  }

  if (oldNextStageId) {
    try {
      oldNextStage = await entityManager.findOne(Stage, {
        id: oldNextStageId,
        $and: [
          { target: { id: orgId, type: IdxTypes.Org } },
          { target: { id: openingId, type: IdxTypes.Opening } },
        ],
      });

      const oldNextStagePreviousStageIndex = oldNextStage.target.findIndex(
        (item) => item.type === IdxTypes.PreviousStage,
      );

      if (oldPreviousStage) {
        // Set the next stage's previous stage Id to be the stage that is being deleted's previous stage Id
        oldNextStage.target[oldNextStagePreviousStageIndex] = {
          id: oldPreviousStageId,
          type: IdxTypes.PreviousStage,
        };
      } else {
        oldNextStage.target[oldNextStagePreviousStageIndex] = {
          id: undefined,
          type: IdxTypes.PreviousStage,
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
