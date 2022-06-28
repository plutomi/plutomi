import { Request, Response } from 'express';
import { DB } from '../../models';
import * as CreateError from '../../utils/createError';

export const deleteOpening = async (req: Request, res: Response) => {
  const { session } = res.locals;
  const { orgId } = session;
  const { openingId } = req.params;

  const [opening, error] = await DB.Openings.deleteOpening({
    openingId,
    orgId,
  });

  if (error) {
    const { status, body } = CreateError.SDK(error, 'An error ocurred deleting your opening');
    return res.status(status).json(body);
  }

  return res.status(200).json({ message: 'Opening deleted!' });
};
