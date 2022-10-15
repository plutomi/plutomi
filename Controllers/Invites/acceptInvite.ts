import { Request, Response } from 'express';
import { DEFAULTS } from '../../Config';
import * as CreateError from '../../utils/createError';
import * as Time from '../../utils/time';
import { DB } from '../../models';

export const acceptInvite = async (req: Request, res: Response) => {
  const { inviteId } = req.params;
  const { user } = req;
  return res.status(200).json({message: "Endpoint temporarily disabled!"})

  // if (user.orgId !== DEFAULTS.NO_ORG) {
  //   return res.status(403).json({
  //     message: `You already belong to an org: ${user.orgId} - delete it before joining another one!`,
  //   });
  // }

  // const [invite, error] = await DB.Invites.getInvite({
  //   inviteId,
  //   userId: user.userId,
  // });

  // if (error) {
  //   const { status, body } = CreateError.SDK(
  //     error,
  //     'An error ocurred getting the info for your invite',
  //   );

  //   return res.status(status).json(body);
  // }

  // if (!invite) {
  //   return res.status(404).json({ message: 'Invite no longer exists' });
  // }
  // // Not sure how this would happen as we do a check before the invite
  // // is sent to prevent this...
  // if (invite.orgId === user.orgId) {
  //   return res.status(400).json({ message: "It appears that you're already in this org!" });
  // }

  // if (invite.expiresAt <= Time.currentISO()) {
  //   return res.status(403).json({
  //     message: 'It looks like that invite has expired, ask the org admin to send you another one!',
  //   });
  // }

  // const [joined, joinError] = await DB.Invites.acceptInvite({
  //   userId: user.userId,
  //   invite,
  // });

  // if (joinError) {
  //   const { status, body } = CreateError.SDK(joinError, 'We were unable to accept that invite');
  //   return res.status(status).json(body);
  // }

  // return res.status(200).json({ message: `You've joined the ${invite.orgName}!` });
};
