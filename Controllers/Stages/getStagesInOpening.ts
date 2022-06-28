import { Request, Response } from 'express';
import { DB } from '../../models';
import * as CreateError from '../../utils/createError';

export const getStagesInOpening = async (req: Request, res: Response) => {
  const { user } = req;

  const { openingId } = req.params;

  const [opening, openingError] = await DB.Openings.getOpening({
    openingId,
    orgId: user.orgId,
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
  const [allCurrentStages, allStagesError] = await DB.Stages.getStagesInOpening({
    openingId,
    orgId: user.orgId,
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
