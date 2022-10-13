import { Request, Response } from 'express';
import Joi from 'joi';
import { DEFAULTS, JOI_SETTINGS, JoiOrgId } from '../../Config';
import * as CreateError from '../../utils/createError';
import { DynamoOrg } from '../../types/dynamo';
import { getInvitesForUser } from '../../models/Invites';
import { DB } from '../../models';
import { Org } from '../../entities';

export type APICreateOrgOptions = Required<Pick<DynamoOrg, 'orgId' | 'displayName'>>;

const schema = Joi.object({
  body: {
    orgId: JoiOrgId,
    displayName: Joi.string(),
  },
}).options(JOI_SETTINGS);

export const createAndJoinOrg = async (req: Request, res: Response) => {
  const { user, entityManager } = req;
  try {
    await schema.validateAsync(req);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);

    return res.status(status).json(body);
  }

  if (user.org) {
    return res.status(403).json({ message: 'You already belong to an org!' });
  }

  // TODO get pending invites!!!!!!!!!!
  // const [pendingInvites, error] = await getInvitesForUser({
  //   userId: user.userId,
  // });

  // if (error) {
  //   const { status, body } = CreateError.SDK(
  //     error,
  //     'Unable to create org - error retrieving invites',
  //   );

  //   return res.status(status).json(body);
  // }

  // if (pendingInvites && pendingInvites.length > 0) {
  //   return res.status(403).json({
  //     message:
  //       'You seem to have pending invites, please accept or reject them before creating an org :)',
  //   });
  // }

  const { displayName, orgId }: APICreateOrgOptions = req.body;

  const newOrg = new Org({
    createdBy: user,
    orgId,
    displayName,
  });

  newOrg.users.add(user);

  // TODO make this a transaction
  try {
    await entityManager.persistAndFlush(newOrg);
  } catch (error) {
    const message = 'Error ocurred creating the org';
    console.error(message, error);
    return res.status(500).json({ message, error });
  }

  return res.status(201).json({ message: 'Org created!' });
};
