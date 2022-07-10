import { Request, Response } from 'express';
import { DB } from '../../models';
import * as CreateError from '../../utils/createError';

export const deleteOpening = async (req: Request, res: Response) => {
  const { openingId } = req.params;
  const { user } = req;

  const [opening, error] = await DB.Openings.deleteOpening({
    openingId,
    orgId: user.orgId,
    updateOrg: true,
  });

  if (error) {
    const { status, body } = CreateError.SDK(error, 'An error ocurred deleting your opening');
    return res.status(status).json(body);
  }

  return res.status(200).json({ message: 'Opening deleted!' });
};
