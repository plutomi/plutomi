import { Request, Response } from 'express';
import { pick } from 'lodash';
import { Org } from '../../entities/Org';
import { DB } from '../../models';
import * as CreateError from '../../utils/createError';

export const getOrg = async (req: Request, res: Response) => {
  const { orgId } = req.params;

  try {
    const org = await Org.findById(orgId).select('displayName');
    if (!org) {
      return res.status(404).json({ message: 'Org not found' });
    }

    return res.status(200).json(org);
  } catch (error) {
    return res.status(200).json({ message: 'An error ocurred retrieving that org' });
  }
};
