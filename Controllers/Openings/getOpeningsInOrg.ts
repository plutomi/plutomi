import { Request, Response } from 'express';
// import { Opening } from '../../entities';
import { IdxTypes } from '../../types/main';
import { findInTargetArray } from '../../utils/findInTargetArray';

export const getOpeningsInOrg = async (req: Request, res: Response) => {
  const { user } = req;
  return res.status(200).json({ message: 'Endpoint temp disabled' });

  // const orgId = findInTargetArray({ entity: IdxTypes.Org, targetArray: user.target });

  // try {
  //   // TODO: Add type safety on this search
  //   const openings = await entityManager.find(Opening, {
  //     target: {
  //       id: orgId,
  //       type: IdxTypes.Org,
  //     },
  //   });

  //   return res.status(200).json(openings);
  // } catch (error) {
  //   const message = 'An error ocurred retrieving openings in your org';
  //   console.error(message, error);
  //   return res.status(500).json({ message, error });
  // }
};
