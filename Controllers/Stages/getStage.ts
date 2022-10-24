import { Request, Response } from 'express';
// import { Stage } from '../../entities';
import { IdxTypes } from '../../types/main';
import { findInTargetArray } from '../../utils/findInTargetArray';

export const getStage = async (req: Request, res: Response) => {
  const { user } = req;
  const { openingId, stageId } = req.params;
  // const orgId = findInTargetArray({ entity: IdxTypes.Org, targetArray: user.target });

  return res.status(200).json({ message: 'Endpoint temp disabled' });
  // let stage: Stage;

  // try {
  //   stage = await entityManager.findOne(Stage, {
  //     id: stageId,
  //     $and: [
  //       {
  //         target: { id: orgId, type: IdxTypes.Org },
  //       },
  //       {
  //         target: { id: openingId, type: IdxTypes.Opening },
  //       },
  //     ],
  //   });
  // } catch (error) {
  //   const message = 'An error ocurred retrieving stage info';
  //   console.error(message, error);
  //   return res.status(500).json({ message, error });
  // }

  // if (!stage) {
  //   return res.status(404).json({ message: 'Stage not found' });
  // }

  // return res.status(200).json(stage);
};
