import { Request, Response } from 'express';
import { pick } from 'lodash';
import * as CreateError from '../../utils/createError';
import { OpeningState } from '../../Config';

export const getPublicOpening = async (req: Request, res: Response) => {
  const { orgId, openingId } = req.params;
  return res.status(200).json({ message: 'Endpoint temp disabled' });

  // const [opening, openingsError] = await DB.Openings.getOpening({
  //   orgId,
  //   openingId,
  // });

  // if (openingsError) {
  //   const { status, body } = CreateError.SDK(
  //     openingsError,
  //     "An error ocurred retrieving this opening's info",
  //   );
  //   return res.status(status).json(body);
  // }

  // if (!opening || opening.GSI1SK === OpeningState.Private) {
  //   return res.status(404).json({ message: 'Opening does not exist' });
  // }

  // const modifiedOpening = pick(opening, ['openingName', 'createdAt', 'openingId', 'orgId']);

  // return res.status(200).json(modifiedOpening);
};
