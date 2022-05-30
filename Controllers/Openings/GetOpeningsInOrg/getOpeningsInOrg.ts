import { Request, Response } from 'express';
import DB from '../../../models';
import * as CreateError from '../../../utils/createError';

export const main = async (req: Request, res: Response) => {
  const { session } = res.locals;
  const [openings, openingsError] = await DB.Openings.getOpeningsInOrg({
    orgId: session.orgId,
  });

  if (openingsError) {
    console.error('Openings error');
    const { status, body } = CreateError.SDK(openingsError, 'An error ocurred retrieving openings');

    return res.status(status).json(body);
  }

  return res.status(200).json(openings);
};
