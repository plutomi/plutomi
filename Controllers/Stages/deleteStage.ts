import { Request, Response } from 'express';
// import { Opening, Stage } from '../../entities';
import { findInTargetArray } from '../../utils/findInTargetArray';

export const deleteStage = async (req: Request, res: Response) => {
  const { user } = req;
  const { openingId, stageId } = req.params;
  // const orgId = findInTargetArray({ entity: IdxTypes.Org, targetArray: user.target });

  return res.status(200).json({ message: 'Endpoint temp disabled' });
  // let opening: Opening;

  // try {
  //   opening = await entityManager.findOne(Opening, {
  //     id: openingId,
  //     $and: [{ target: { id: orgId, type: IdxTypes.Org } }],
  //   });
  // } catch (error) {
  //   const message = 'An error ocurred finding opening info';
  //   console.error(message, error);
  //   return res.status(500).json({ message, error });
  // }

  // if (!opening) {
  //   return res.status(404).json({
  //     message: `Hmm... it appears that the opening with ID of '${openingId}' no longer exists`,
  //   });
  // }

  // let ourStage: Stage;

  // try {
  //   ourStage = await entityManager.findOne(Stage, {
  //     id: stageId,
  //     $and: [
  //       { target: { id: orgId, type: IdxTypes.Org } },
  //       { target: { id: opening.id, type: IdxTypes.Opening } },
  //     ],
  //   });
  // } catch (error) {
  //   const message = 'An error ocurred finding the stage info';
  //   console.error(message, error);
  //   return res.status(500).json({ message, error });
  // }

  // if (!ourStage) {
  //   return res.status(404).json({
  //     message: `Hmm... it appears that the stage with ID of '${stageId}' no longer exists`,
  //   });
  // }

  // const oldPreviousStageId = findInTargetArray({
  //   entity: IdxTypes.PreviousStage,
  //   targetArray: ourStage.target,
  // });

  // const oldNextStageId = findInTargetArray({
  //   entity: IdxTypes.NextStage,
  //   targetArray: ourStage.target,
  // });

  // let oldPreviousStage: Stage;
  // let oldNextStage: Stage;

  // // TODO these can be done in parallel
  // if (oldPreviousStageId) {
  //   try {
  //     oldPreviousStage = await entityManager.findOne(Stage, {
  //       id: oldPreviousStageId,
  //       $and: [
  //         { target: { id: orgId, type: IdxTypes.Org } },
  //         { target: { id: openingId, type: IdxTypes.Opening } },
  //       ],
  //     });

  //     const oldPreviousStageNextStageIndex = oldPreviousStage.target.findIndex(
  //       (item) => item.type === IdxTypes.NextStage,
  //     );

  //     if (oldNextStageId) {
  //       // Set the previous stage's next stage Id to be the stage that is being deleted's next stage Id
  //       oldPreviousStage.target[oldPreviousStageNextStageIndex] = {
  //         id: oldNextStageId,
  //         type: IdxTypes.NextStage,
  //       };
  //     } else {
  //       oldPreviousStage.target[oldPreviousStageNextStageIndex] = {
  //         id: undefined,
  //         type: IdxTypes.NextStage,
  //       };
  //     }

  //     entityManager.persist(oldPreviousStage);
  //   } catch (error) {
  //     const message = 'An error ocurred finding the previous stage info';
  //     console.error(message, error);
  //     return res.status(500).json({ message, error });
  //   }
  // }

  // if (oldNextStageId) {
  //   try {
  //     oldNextStage = await entityManager.findOne(Stage, {
  //       id: oldNextStageId,
  //       $and: [
  //         { target: { id: orgId, type: IdxTypes.Org } },
  //         { target: { id: openingId, type: IdxTypes.Opening } },
  //       ],
  //     });

  //     const oldNextStagePreviousStageIndex = oldNextStage.target.findIndex(
  //       (item) => item.type === IdxTypes.PreviousStage,
  //     );

  //     if (oldPreviousStage) {
  //       // Set the next stage's previous stage Id to be the stage that is being deleted's previous stage Id
  //       oldNextStage.target[oldNextStagePreviousStageIndex] = {
  //         id: oldPreviousStageId,
  //         type: IdxTypes.PreviousStage,
  //       };
  //     } else {
  //       oldNextStage.target[oldNextStagePreviousStageIndex] = {
  //         id: undefined,
  //         type: IdxTypes.PreviousStage,
  //       };
  //     }

  //     entityManager.persist(oldNextStage);
  //   } catch (error) {
  //     const message = 'An error ocurred finding the previous stage info';
  //     console.error(message, error);
  //     return res.status(500).json({ message, error });
  //   }
  // }

  // entityManager.remove(ourStage);
  // opening.totalStages - +opening.totalStages - 1;

  // try {
  //   await entityManager.flush();
  //   return res.status(200).json({ message: 'Stage deleted!' });
  // } catch (error) {
  //   const message = 'Error ocurred deleting stage';
  //   console.error(message, error);
  //   return res.status(500).json({ message, error });
  // }
};
