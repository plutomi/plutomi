import { Request, Response } from 'express';
import { Opening, Stage } from '../../entities';
import { IndexedEntities } from '../../types/main';
import { findInTargetArray } from '../../utils/findInTargetArray';
import { sortStages } from '../../utils/sortStages';

export const getStagesInOpening = async (req: Request, res: Response) => {
  const { user, entityManager } = req;
  const orgId = findInTargetArray({ entity: IndexedEntities.Org, targetArray: user.target });
  const { openingId } = req.params;

  let opening: Opening;

  try {
    opening = await entityManager.findOne(Opening, {
      id: openingId,
      $and: [{ target: { id: orgId, type: IndexedEntities.Org } }],
    });
  } catch (error) {
    const message = 'An error ocurred retrieving opening info';
    console.error(message, error);
    return res.status(500).json({ message, error });
  }

  if (!opening) {
    return res.status(404).json({ message: 'Opening does not exist' });
  }

  let allStages: Stage[];

  try {
    allStages = await entityManager.find(Stage, {
      $and: [
        { target: { id: orgId, type: IndexedEntities.Org } },
        { target: { id: openingId, type: IndexedEntities.Opening } },
      ],
    });

    // console.log(`All stages in opening`, allStages);

    const sorted = sortStages(allStages);
    // console.log(`All stages sorted `, sorted);

    return res.status(200).json(sorted);
  } catch (error) {
    const message = 'An error ocurred retrieving all the current stages';
    console.error(message, error);
    return res.status(500).json({ message, error });
  }
};
