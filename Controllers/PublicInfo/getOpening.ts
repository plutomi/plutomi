import { Request, Response } from 'express';
import { OpeningState } from '../../Config';
import { Opening } from '../../entities/Opening';

export const getOpening = async (req: Request, res: Response) => {
  const { orgId, openingId } = req.params;

  try {
    const opening = await Opening.findById(openingId, {
      org: orgId,
      visibility: OpeningState.PUBLIC,
    }).select('org name createdAt');

    if (!opening) {
      return res.status(404).json({ message: 'Opening does not exist' });
    }

    return res.status(200).json(opening);
  } catch (error) {
    return res.status(500).json({ message: 'An error ocurred retrieving that opening' });
  }
};
