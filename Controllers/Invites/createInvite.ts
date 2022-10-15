import { Request, Response } from 'express';
import Joi from 'joi';
import emailValidator from 'deep-email-validator';
import { pick } from 'lodash';
import {
  DEFAULTS,
  Emails,
  ERRORS,
  JOI_SETTINGS,
  ORG_INVITE_EXPIRY_DAYS,
  TIME_UNITS,
  WEBSITE_URL,
} from '../../Config';
import * as CreateError from '../../utils/createError';
import * as Time from '../../utils/time';
import { getOrg } from '../../models/Orgs';
import { DB } from '../../models';
import { sendEmail } from '../../models/Emails/sendEmail';
import { nameIsDefault } from '../../utils/compareStrings/nameIsDefault';
import { twoStringsMatch } from '../../utils/compareStrings';

const schema = Joi.object({
  body: {
    recipientEmail: Joi.string().email().trim(),
    expiresInDays: Joi.number().min(1).max(365),
  },
}).options(JOI_SETTINGS);

export const createInvite = async (req: Request, res: Response) => {
  try {
    await schema.validateAsync(req);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }

  const { user } = req;
  const { recipientEmail, expiresInDays } = req.body;

  return res.status(200).json({ message: 'TODO Endpoint temporarily disabled!' });

  // const validation = await emailValidator({
  //   email: recipientEmail,
  //   validateSMTP: false, // BUG, this isnt working
  // });
  // if (!validation.valid) {
  //   return res.status(400).json({
  //     message: ERRORS.EMAIL_VALIDATION,
  //   });
  // }

  // if (
  //   twoStringsMatch({
  //     string1: user.firstName,
  //     string2: recipientEmail,
  //   })
  // ) {
  //   return res.status(403).json({ message: `You can't invite yourself` });
  // }

  // const userUsingDefaultName = nameIsDefault({
  //   firstName: user.firstName,
  //   lastName: user.lastName,
  // });

  // // if (userUsingDefaultName) {
  // //   return res.status(403).json({
  // //     message: `Please update your first and last name before sending invites to team members. You can do this at ${WEBSITE_URL}/profile`,
  // //   });
  // // }
  // const [org, error] = await getOrg({ orgId: user.orgId });

  // if (error) {
  //   const { status, body } = CreateError.SDK(
  //     error,
  //     'An error ocurred retrieving your org information',
  //   );
  //   return res.status(status).json(body);
  // }

  // if (!org) {
  //   return res.status(404).json({ message: 'Org does not exist' });
  // }

  // // eslint-disable-next-line prefer-const
  // let [recipient, recipientError] = await DB.Users.getUserByEmail({
  //   email: recipientEmail,
  // });

  // if (recipientError) {
  //   const { status, body } = CreateError.SDK(
  //     error,
  //     "An error ocurred getting your invitee's information",
  //   );
  //   return res.status(status).json(body);
  // }

  // // Invite is for a user that doesn't exist
  // if (!recipient) {
  //   const [createdUser, createUserError] = await DB.Users.createUser({
  //     email: recipientEmail,
  //   });

  //   if (createUserError) {
  //     const { status, body } = CreateError.SDK(
  //       createUserError,
  //       'An error ocurred creating an account for your invitee',
  //     );

  //     return res.status(status).json(body);
  //   }
  //   recipient = createdUser;
  // }

  // if (recipient.orgId === user.orgId) {
  //   return res.status(403).json({ message: 'User is already in your org!' });
  // }

  // // Check if the user we are inviting already has pending invites for the current org
  // const [recipientInvites, recipientInvitesError] = await DB.Invites.getInvitesForUser({
  //   userId: recipient.userId,
  // });

  // if (recipientInvitesError) {
  //   const { status, body } = CreateError.SDK(
  //     recipientInvitesError,
  //     'An error ocurred while checking to see if your invitee has pending invites',
  //   );
  //   return res.status(status).json(body);
  // }

  // const pendingInvites = recipientInvites.some((invite) => invite.orgId === user.orgId);

  // if (pendingInvites) {
  //   return res.status(403).json({
  //     message: 'This user already has a pending invite to your org! They can log in to claim it.',
  //   });
  // }

  // // TODO this can get reworked with the new syncrhonous emails
  // const [inviteCreated, inviteError] = await DB.Invites.createInvite({
  //   recipient: pick(recipient, ['userId', 'email', 'firstName', 'lastName', 'unsubscribeKey']),
  //   orgName: org.displayName,
  //   expiresAt: Time.futureISO({
  //     amount: expiresInDays || ORG_INVITE_EXPIRY_DAYS,
  //     unit: TIME_UNITS.DAYS,
  //   }),
  //   createdBy: pick(user, ['userId', 'firstName', 'lastName', 'orgId', 'email']),
  // });

  // if (inviteError) {
  //   const { status, body } = CreateError.SDK(inviteError, 'An error ocurred creating your invite');

  //   return res.status(status).json(body);
  // }

  // res.status(201).json({ message: `Invite sent to '${recipientEmail}'` });

  // const subject = userUsingDefaultName
  //   ? `You've been invited to join ${org.displayName} on Plutomi!`
  //   : `${user.firstName} ${user.lastName} has invited you to join them on ${org.displayName}`;
  // try {
  //   await sendEmail({
  //     from: {
  //       header: `Plutomi`,
  //       email: Emails.JOIN,
  //     },
  //     to: recipient.email,
  //     subject,
  //     body: `<h4>You can log in at <a href="${WEBSITE_URL}" target="_blank" rel=noreferrer>${WEBSITE_URL}</a> to accept their invite!</h4><p>If you believe this email was received in error, you can safely ignore it.</p>`,
  //   });
  //   return;
  // } catch (error) {
  //   console.error('Error ocurred inviting a user to an org', error);
  // }
};
