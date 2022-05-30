import { Request, Response } from 'express';
import { pick } from 'lodash';
import * as CreateError from '../../../utils/createError';
import { OpeningState } from '../../../Config';
import DB from '../../../models';

export const main = async (req: Request, res: Response) => {
  const { orgId } = req.params;

  const [openings, openingsError] = await DB.Openings.getOpeningsInOrg({
    orgId,
    GSI1SK: OpeningState.PUBLIC,
  });

  if (openingsError) {
    const { status, body } = CreateError.SDK(
      openingsError,
      'An error ocurred retrieving openings for this org',
    );
    return res.status(status).json(body);
  }

  const modifiedOpenings = openings.map((opening) =>
    pick(opening, ['openingName', 'createdAt', 'openingId']),
  );

  return res.status(200).json(modifiedOpenings);
};
