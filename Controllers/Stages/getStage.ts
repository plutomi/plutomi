import { Request, Response } from 'express';
import DB from '../../models';
import * as CreateError from '../../utils/createError';

export const getStage = async (req: Request, res: Response) => {
  const { session } = res.locals;

  const { openingId, stageId } = req.params;
  const [stage, stageError] = await DB.Stages.getStage({
    orgId: session.orgId,
    stageId,
    openingId,
  });

  if (stageError) {
    const { status, body } = CreateError.SDK(
      stageError,
      'An error ocurred retrieving that stage info',
    );

    return res.status(status).json(body);
  }

  if (!stage) {
    return res.status(404).json({ message: 'Stage not found' });
  }

  return res.status(200).json(stage);
};
