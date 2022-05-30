import { Request, Response } from 'express';
import { pick } from 'lodash';
import * as CreateError from '../../../utils/createError';
import { OpeningState } from '../../../Config';
import { getOpening } from '../../../models/Openings';

export const main = async (req: Request, res: Response) => {
  const { orgId, openingId } = req.params;

  const [opening, openingsError] = await getOpening({
    orgId,
    openingId,
  });

  if (openingsError) {
    const { status, body } = CreateError.SDK(
      openingsError,
      "An error ocurred retrieving this opening's info",
    );
    return res.status(status).json(body);
  }

  if (opening.GSI1SK === OpeningState.PRIVATE) {
    return res.status(403).json({ message: 'You cannot view this opening at this time' });
  }

  const modifiedOpening = pick(opening, ['openingName', 'createdAt', 'openingId']);

  return res.status(200).json(modifiedOpening);
};
