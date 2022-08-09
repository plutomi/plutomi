import { Request, Response } from 'express';
import { OpeningState } from '../../Config';
import { Opening } from '../../entities/Opening';

export const getOpeningsInOrg = async (req: Request, res: Response) => {
  const { orgId } = req.params;

  try {
    const openings = await Opening.find(
      {},
      {
        org: orgId,
        visibility: OpeningState.PUBLIC,
      },
    ).select('org name createdAt');

    return res.status(200).json(openings);
  } catch (error) {
    return res.status(500).json({ message: 'An error ocurred retrieving that opening' });
  }
};
