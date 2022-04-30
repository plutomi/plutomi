import { Request, Response } from 'express';
import * as Stages from '../../models/Stages';
import * as CreateError from '../../utils/createError';
const main = async (req: Request, res: Response) => {
  const { session } = res.locals;

  const { openingId, stageId } = req.params;
  const [stage, stageError] = await Stages.GetStageById({
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
export default main;
