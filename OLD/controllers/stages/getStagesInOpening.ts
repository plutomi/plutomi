// import { Request, Response } from 'express';
// import { Filter } from 'mongodb';
// import { IndexableProperties } from '../../@types/indexableProperties';
// import { StageEntity } from '../../models';
// import { OpeningEntity } from '../../@types/entities/application';
// import { collections } from '../../utils/connectToDatabase';
// import { sortStages } from '../../utils/sortStages';

// export const getStagesInOpening = async (req: Request, res: Response) => {
//   const { user } = req;

//   const { orgId } = user;
//   const { openingId } = req.params;

//   let opening: OpeningEntity;

//   const openingFilter: Filter<OpeningEntity> = {
//     id: openingId,
//     orgId,
//   };
//   try {
//     opening = (await collections.openings.findOne(openingFilter)) as OpeningEntity;
//   } catch (error) {
//     const message = 'An error ocurred retrieving opening info';
//     console.error(message, error);
//     return res.status(500).json(message);
//   }

//   if (!opening) {
//     return res.status(404).json({ message: 'Opening does not exist' });
//   }

//   let allStages: StageEntity[];

//   const allStagesFilter: Filter<StageEntity> = {
//     orgId,
//     target: [{ property: IndexableProperties.CreatedAt, value: openingId }],
//     // !BUT IT IS ALLOWING ORG!!!! WHAT THE FUCK!?????????????????
//   };
//   try {
//     allStages = (await collections.stages.find(allStagesFilter).toArray()) as StageEntity[];

//     console.log('Attempting to sort');
//     const allSortedStages = sortStages(allStages);
//     console.log('Sorted!');
//     return res.status(200).json(allSortedStages);
//   } catch (error) {
//     const message = 'An error ocurred retrieving all the current stages';
//     console.error(message, error);
//     return res.status(500).json(message);
//   }
// };
