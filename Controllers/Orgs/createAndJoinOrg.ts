import { Request, Response } from 'express';
import Joi from 'joi';
import { DEFAULTS, JOI_SETTINGS, JoiOrgId } from '../../Config';
import * as CreateError from '../../utils/createError';
import { DynamoOrg } from '../../types/dynamo';
import { getInvitesForUser } from '../../models/Invites';
import { DB } from '../../models';

export type APICreateOrgOptions = Required<Pick<DynamoOrg, 'orgId' | 'displayName'>>;

const schema = Joi.object({
  body: {
    orgId: JoiOrgId,
    displayName: Joi.string(),
  },
}).options(JOI_SETTINGS);

export const createAndJoinOrg = async (req: Request, res: Response) => {
  const { user } = req;
  try {
    await schema.validateAsync(req);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);

    return res.status(status).json(body);
  }

  if (user.orgId !== DEFAULTS.NO_ORG) {
    return res.status(403).json({ message: 'You already belong to an org!' });
  }

  const [pendingInvites, error] = await getInvitesForUser({
    userId: user.userId,
  });

  if (error) {
    const { status, body } = CreateError.SDK(
      error,
      'Unable to create org - error retrieving invites',
    );

    return res.status(status).json(body);
  }

  if (pendingInvites && pendingInvites.length > 0) {
    return res.status(403).json({
      message:
        'You seem to have pending invites, please accept or reject them before creating an org :)',
    });
  }

  const { displayName, orgId }: APICreateOrgOptions = req.body;

  const [created, failed] = await DB.Orgs.createAndJoinOrg({
    userId: user.userId,
    orgId,
    displayName,
  });

  if (failed) {
    if (failed.name === 'TransactionCanceledException') {
      return res.status(409).json({
        message: 'It appears that that org ID is already taken - try another',
      });
    }
    const { status, body } = CreateError.SDK(failed, 'Unable to create org');
    return res.status(status).json(body);
  }

  return res.status(201).json({ message: 'Org created!' });
};
