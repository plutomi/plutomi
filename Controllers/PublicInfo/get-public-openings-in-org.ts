import { Request, Response } from 'express';
import { pick } from 'lodash';
import * as CreateError from '../../utils/createError';
import * as Openings from '../../models/Openings';
import { OPENING_STATE } from '../../Config';

const main = async (req: Request, res: Response) => {
  const { orgId } = req.params;

  const [openings, openingsError] = await Openings.GetOpeningsInOrg({
    orgId,
    GSI1SK: OPENING_STATE.PUBLIC,
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
export default main;
