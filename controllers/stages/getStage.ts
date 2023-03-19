// import { Request, Response } from 'express';
// import { Filter } from 'mongodb';
// import { IndexableProperties } from '../../@types/indexableProperties';
// import { StageEntity } from '../../models';
// import { collections } from '../../utils/connectToDatabase';
// import { findInTargetArray } from '../../utils/findInTargetArray';

// export const getStage = async (req: Request, res: Response) => {
//   const { user } = req;
//   const { openingId, stageId } = req.params;
//   const { orgId } = user;

//   let stage: StageEntity;

//   const stageFilter: Filter<StageEntity> = {
//     id: stageId,
//     orgId,
//     // TODO make this so only stage ID is required!
//     target: { property: IndexableProperties.Opening, value: openingId },
//   };
//   try {
//     stage = (await collections.stages.findOne(stageFilter)) as StageEntity;
//   } catch (error) {
//     const message = 'An error ocurred retrieving stage info';
//     console.error(message, error);
//     return res.status(500).json(message);
//   }

//   if (!stage) {
//     return res.status(404).json({ message: 'Stage not found' });
//   }

//   return res.status(200).json(stage);
// };
