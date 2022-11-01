import { Request, Response } from 'express';
import { pick } from 'lodash';
import { OpeningState } from '../../Config';

export const getPublicOpeningsInOrg = async (req: Request, res: Response) => {
  const { orgId } = req.params;

  // const [openings, openingsError] = await DB.Openings.getOpeningsInOrg({
  //   orgId,
  //   GSI1SK: OpeningState.Public,
  // });

  // if (openingsError) {
  //   const { status, body } = CreateError.SDK(
  //     openingsError,
  //     'An error ocurred retrieving openings for this org',
  //   );
  //   return res.status(status).json(body);
  // }

  // const modifiedOpenings = openings.map((opening: DynamoOpening) =>
  //   pick(opening, ['openingName', 'createdAt', 'openingId', 'orgId']),
  // );

  return res.status(200).json({ message: 'Endpoint temp disabled' });
};
