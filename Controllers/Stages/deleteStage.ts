import { Request, Response } from 'express';
import { DB } from '../../models';
import * as CreateError from '../../utils/createError';

export const deleteStage = async (req: Request, res: Response) => {
  const { user } = req;
  const { openingId, stageId } = req.params;
  const [opening, openingError] = await DB.Openings.getOpening({
    openingId,
    orgId: user.orgId,
  });

  if (openingError) {
    const { status, body } = CreateError.SDK(
      openingError,
      'An error ocurred retrieving your opening info',
    );
    return res.status(status).json(body);
  }

  if (!opening) {
    return res.status(404).json({
      message: `Hmm... it appears that the opening with ID of '${openingId}' no longer exists`,
    });
  }

  const [deleted, error] = await DB.Stages.deleteStage({
    openingId,
    orgId: user.orgId,
    stageId,
    deleteIndex: opening.stageOrder.indexOf(stageId),
    updateOpening: true,
  });

  if (error) {
    const { status, body } = CreateError.SDK(error, 'An error ocurred deleting that stage');
    return res.status(status).json(body);
  }

  return res.status(200).json({ message: 'Stage deleted!' });
};
