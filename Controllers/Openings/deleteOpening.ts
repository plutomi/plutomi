import { Request, Response } from 'express';
// import { Opening } from '../../entities';
import { findInTargetArray } from '../../utils/findInTargetArray';

export const deleteOpening = async (req: Request, res: Response) => {
  const { openingId } = req.params;
  const { user } = req;

  return res.status(200).json({ message: 'Endpoint temp disabled' });
  // let openingToDelete: Opening;
  // const orgId = findInTargetArray({ entity: IdxTypes.Org, targetArray: user.target });
  // try {
  //   openingToDelete = await entityManager.findOne(Opening, {
  //     id: openingId,
  //     target: {
  //       // Should be redundant
  //       id: orgId,
  //       type: IdxTypes.Org,
  //     },
  //   });

  //   if (!openingToDelete) {
  //     return res.status(404).json({ message: 'Opening not found!' });
  //   }
  // } catch (error) {
  //   const message = `An error ocurred retrieving opening info`;
  //   console.error(message, error);
  //   return res.status(500).json({ message, error });
  // }

  // try {
  //   await entityManager.removeAndFlush(Opening);
  // } catch (error) {
  //   const message = `An error ocurred deleting that opening`;
  //   console.error(message, error);
  //   return res.status(500).json({ message, error });
  // }
  // return res.status(200).json({ message: 'Opening deleted!' });
};
