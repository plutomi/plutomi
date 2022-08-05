import { Request, Response } from 'express';
import Joi from 'joi';
import { DEFAULTS, JOI_SETTINGS, JoiOrgId } from '../../Config';
import * as CreateError from '../../utils/createError';
import { DynamoOrg } from '../../types/dynamo';
import { DB } from '../../models';
import { Org } from '../../entities/Org';
import { User } from '../../entities/User';
import { OrgInvite } from '../../entities/Invites';

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

  if (user.org !== DEFAULTS.NO_ORG) {
    return res.status(403).json({ message: 'You already belong to an org!' });
  }

  try {
    const userInvites = await OrgInvite.find(
      {},
      {
        recipient: user,
      },
    );
  } catch (error) {
    return res.status(500).json({ message: 'An error ocurred retrieving your current invites' });
  }

  if (user.totalInvites) {
    return res.status(403).json({
      message:
        'You seem to have pending invites, please accept or reject them before creating an org :)',
    });
  }
  
  const { displayName, orgId }: APICreateOrgOptions = req.body;

  const newOrg = new Org({
    orgId,
    displayName,
    totalApplicants: 1,
  });

  // TODO this needs to be a transaction
  try {
    await newOrg.save();

    try {
      await User.updateOne(
        {
          _id: user._id,
        },
        {
          $set: {
            orgId,
            orgJoinDate: new Date(),
          },
        },
      );
      return res.status(201).json({ message: 'Org joined!' });
    } catch (error) {
      return res.status(500).json({ message: 'Unable to update user to join org' });
    }
  } catch (error) {
    console.error(`An error ocurred creating that org`);
    return res.status(500).json({ message: 'Unable to create org' });
  }

  return res.status(201).json({ message: 'Org created!' });
};
