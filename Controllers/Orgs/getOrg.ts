import { Request, Response } from 'express';
import { OrgEntity } from '../../models';
import { Filter } from 'mongodb';
import { findInTargetArray } from '../../utils/findInTargetArray';
import { IndexableProperties } from '../../@types/indexableProperties';
import { collections } from '../../utils/connectToDatabase';

export const getOrg = async (req: Request, res: Response) => {
  const { user } = req;

  let org: OrgEntity;

  const orgId = findInTargetArray(IndexableProperties.Org, user);

  if (!orgId || !user.orgJoinDate) {
    return res.status(400).json({ message: "You don't appear to be in an org!" });
  }

  const orgFilter: Filter<OrgEntity> = {
    target: { property: IndexableProperties.Id, value: orgId },
  };

  try {
    org = (await collections.orgs.findOne(orgFilter)) as OrgEntity;
  } catch (error) {
    const message = `An error ocurred returning org info`;
    console.error(message, error);
    return res.status(500).json({ message, error });
  }

  if (!org) return res.status(404).json({ message: 'Org not found' });

  return res.status(200).json(org);
};
