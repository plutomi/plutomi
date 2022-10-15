import { Request, Response } from 'express';
import Joi from 'joi';
import { JOI_SETTINGS, JoiOrgId } from '../../Config';
import * as CreateError from '../../utils/createError';
import { Org } from '../../entities';
import { IndexedEntities } from '../../types/main';

export type APICreateOrgOptions = Required<Pick<Org, 'orgId' | 'displayName'>>;

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

  if (user.orgJoinDate) {
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

  let org: Org;

  try {
    org = await req.entityManager.findOne(Org, {
      orgId, // TODO use target array !!!
    });
  } catch (error) {
    const message = `Error ocurred checking if that org already exists`;
    console.error(message, error);
    return res.status(500).json({ message, error });
  }

  if (org) {
    return res.status(403).json({
      message: `An org already exists with this ID ('${orgId}'), please choose another!`,
    });
  }

  // TODO make this a transaction
  const newOrg = new Org({
    orgId,
    displayName,
    target: [{ id: user.id, type: IndexedEntities.CreatedBy }],
  });

  user.target.push({ id: orgId, type: IndexedEntities.Org });
  user.orgJoinDate = new Date();
  entityManager.persist(newOrg);
  entityManager.persist(user);

  try {
    await entityManager.flush();

    console.log(`saved user with new org`);
    return res.status(201).json({ message: 'Org created!', org: newOrg });
  } catch (error) {
    const message = 'Error ocurred creating the org';
    console.error(message, error);
    return res.status(500).json({ message, error });
  }
};
