import { Request, Response } from 'express';
import Joi from 'joi';
import { JOI_SETTINGS, LIMITS, OpeningState } from '../../Config';
import * as CreateError from '../../utils/createError';
// import { DynamoOpening } from '../../types/dynamo';
// import { Opening, Org } from '../../entities';
import { findInTargetArray } from '../../utils/findInTargetArray';
import { IdxTypes } from '../../types/main';

// export type APICreateOpeningOptions = Required<Pick<DynamoOpening, 'openingName'>>;

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

  return res.status(200).json({ message: 'Endpoint temp disabled' });
  // const { openingName }: APICreateOpeningOptions = req.body;
  // const orgId = findInTargetArray({ entity: IdxTypes.Org, targetArray: user.target });

  // let org: Org | undefined;

  // try {
  //   org = await entityManager.findOne(Org, {
  //     orgId,
  //   });
  // } catch (error) {
  //   console.error(`Error ocurred finding that org`, error);
  //   return res.status(500).json({ message: 'An error ocurred finding that org' });
  // }

  // if (!org) {
  //   return res.status(404).json({ message: 'Org not found' });
  // }
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
