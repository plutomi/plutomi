import { Request, Response } from 'express';
import { Org } from '../../entities';
import { DB } from '../../models';
import * as CreateError from '../../utils/createError';

export const getOrg = async (req: Request, res: Response) => {
  const { user, entityManager } = req;

  let org: Org;

  // try {
  //   await entityManager.findOne(Org, {
  //     id: user.org.u,
  //   });
  // } catch (error) {}

  // if (error) {
  //   const { status, body } = CreateError.SDK(error, 'Unable to retrieve org info');

  //   return res.status(status).json(body);
  // }

  // // Not sure how this would be possible but :)
  // if (!org) {
  //   return res.status(404).json({ message: 'Org not found' });
  // }

  return res.status(200).json(org);
};
