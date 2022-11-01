import { Request, Response } from 'express';
import { Filter } from 'mongodb';
import { IndexableProperties } from '../../@types/indexableProperties';
import { StageEntity } from '../../models';
import { OpeningEntity } from '../../models/Opening';
import { collections } from '../../utils/connectToDatabase';
import { findInTargetArray } from '../../utils/findInTargetArray';
import { sortStages } from '../../utils/sortStages';

export const getStagesInOpening = async (req: Request, res: Response) => {
  const { user } = req;
  const orgId = findInTargetArray(IndexableProperties.Org, user);
  const { openingId } = req.params;

  let opening: OpeningEntity;

  const openingFilter: Filter<OpeningEntity> = {
    id: openingId,
    target: { property: IndexableProperties.Org, value: orgId },
  };
  try {
    opening = (await collections.openings.findOne(openingFilter)) as OpeningEntity;
  } catch (error) {
    const message = 'An error ocurred retrieving opening info';
    console.error(message, error);
    return res.status(500).json(message);
  }

  if (!opening) {
    return res.status(404).json({ message: 'Opening does not exist' });
  }

  let allStages: StageEntity[];

  const allStagesFilter: Filter<StageEntity> = {
    $and: [
      { target: { property: IndexableProperties.Org, value: orgId } },
      { target: { property: IndexableProperties.Opening, value: openingId } },
    ],
  };
  try {
    allStages = (await collections.stages.find(allStagesFilter).toArray()) as StageEntity[];

    console.log('Attempting to sort');
    const allSortedStages = sortStages(allStages);
    console.log('Sorted!');
    return res.status(200).json(allSortedStages);
  } catch (error) {
    const message = 'An error ocurred retrieving all the current stages';
    console.error(message, error);
    return res.status(500).json(message);
  }
};
