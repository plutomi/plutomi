import { Request, Response } from 'express';
import Joi from 'joi';
import { JOI_SETTINGS, LIMITS, OpeningState } from '../../Config';
import * as CreateError from '../../utils/createError';
import { Filter } from 'mongodb';
import { findInTargetArray } from '../../utils/findInTargetArray';
import { OpeningEntity } from '../../models/Opening';
import { OrgEntity } from '../../models';
import { IndexableProperties } from '../../@types/indexableProperties';
import { collections } from '../../utils/connectToDatabase';

export type APICreateOpeningOptions = Required<Pick<OpeningEntity, 'name'>>;

const schema = Joi.object({
  body: {
    openingName: Joi.string().max(LIMITS.MAX_OPENING_NAME_LENGTH),
  },
}).options(JOI_SETTINGS);

export const createOpening = async (req: Request, res: Response) => {
  const { user } = req;
  try {
    await schema.validateAsync(req);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }

  const { name }: APICreateOpeningOptions = req.body;
  const orgId = findInTargetArray(IndexableProperties.Org, user);

  let org: OrgEntity | undefined;

  const orgFilter: Filter<OrgEntity> = {
    target: { property: IndexableProperties.Org, value: orgId },
  };
  try {
    org = (await collections.orgs.findOne(orgFilter)) as OrgEntity;
  } catch (error) {
    const message = `An error ocurred finding that org`;
    console.error(message, error);
    return res.status(500).json({ message });
  }

  if (!org) {
    return res.status(404).json({ message: 'Org not found' });
  }


  
  // //
  // const newOpening = new Opening({
  //   name: openingName,
  //   target: [
  //     {
  //       // Should be redundant
  //       id: orgId,
  //       type: IdxTypes.Org,
  //     },
  //     { id: OpeningState.Private, type: IdxTypes.OpeningState },
  //   ],
  // });

  // try {
  //   await entityManager.persistAndFlush(newOpening);
  // } catch (error) {
  //   console.error(`An error ocurred creating your opening`, error);
  //   return res.status(500).json({ message: 'An error ocurred creating your opening' });
  // }

  // return res.status(201).json({ message: 'Opening created!', opening: newOpening });
};
