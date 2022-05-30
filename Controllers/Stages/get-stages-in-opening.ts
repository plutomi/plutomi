import { Request, Response } from 'express';
import { getOpening } from '../../models/Openings';
import { getStagesInOpening } from '../../models/Stages';
import * as CreateError from '../../utils/createError';

const main = async (req: Request, res: Response) => {
  const { session } = res.locals;

  const { openingId } = req.params;

  const [opening, openingError] = await getOpening({
    openingId,
    orgId: session.orgId,
  });

  if (openingError) {
    const { status, body } = CreateError.SDK(
      openingError,
      'An error ocurred getting your opening info',
    );
    return res.status(status).json(body);
  }

  if (!opening) {
    return res.status(404).json({ message: 'Opening does not exist' });
  }
  const [allCurrentStages, allStagesError] = await getStagesInOpening({
    openingId,
    orgId: session.orgId,
    stageOrder: opening.stageOrder, // To order them correctly
  });

  if (allStagesError) {
    console.log('All stages error', allStagesError);
    const { status, body } = CreateError.SDK(
      allStagesError,
      'An error ocurred retrieving all the current stages',
    );

    return res.status(status).json(body);
  }

  return res.status(200).json(allCurrentStages);
};
export default main;
