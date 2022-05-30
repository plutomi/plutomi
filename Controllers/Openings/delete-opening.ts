import { Request, Response } from 'express';
import { deleteOpening } from '../../models/Openings';
import * as CreateError from '../../utils/createError';

const main = async (req: Request, res: Response) => {
  const { session } = res.locals;
  const { orgId } = session;
  const { openingId } = req.params;

  const [opening, error] = await deleteOpening({
    openingId,
    orgId,
  });

  if (error) {
    const { status, body } = CreateError.SDK(error, 'An error ocurred deleting your opening');
    return res.status(status).json(body);
  }

  return res.status(200).json({ message: 'Opening deleted!' });
};
export default main;
