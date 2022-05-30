import { Request, Response } from 'express';
import { getOpening } from '../../models/Openings';
import { deleteStage } from '../../models/Stages';
import * as CreateError from '../../utils/createError';

const main = async (req: Request, res: Response) => {
  const { session } = res.locals;
  const { openingId, stageId } = req.params;
  const [opening, openingError] = await getOpening({
    openingId,
    orgId: session.orgId,
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

  const [deleted, error] = await deleteStage({
    openingId,
    orgId: session.orgId,
    stageId,
    deleteIndex: opening.stageOrder.indexOf(stageId),
  });

  if (error) {
    const { status, body } = CreateError.SDK(error, 'An error ocurred deleting that stage');
    return res.status(status).json(body);
  }

  return res.status(200).json({ message: 'Stage deleted!' });
};
export default main;
