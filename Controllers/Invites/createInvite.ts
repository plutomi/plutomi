import { Request, Response } from 'express';
import Joi from 'joi';
import emailValidator from 'deep-email-validator';
import { pick } from 'lodash';
import { ERRORS, JOI_SETTINGS, ORG_INVITE_EXPIRY_DAYS, TIME_UNITS } from '../../Config';
import * as CreateError from '../../utils/createError';
import * as Time from '../../utils/time';
import { getOrg } from '../../models/Orgs';
import DB from '../../models';

const schema = Joi.object({
  body: {
    recipientEmail: Joi.string().email().trim(),
    expiresInDays: Joi.number().min(1).max(365).optional(),
  },
}).options(JOI_SETTINGS);

export const main = async (req: Request, res: Response) => {
  try {
    await schema.validateAsync(req);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }

  const { session } = res.locals;
  const { recipientEmail, expiresInDays } = req.body;

  const validation = await emailValidator({
    email: recipientEmail,
    validateSMTP: false, // BUG, this isnt working
  });
  if (!validation.valid) {
    return res.status(400).json({
      message: ERRORS.EMAIL_VALIDATION,
    });
  }

  if (session.email === recipientEmail) {
    return res.status(403).json({ message: `You can't invite yourself` });
  }

  const [org, error] = await getOrg({ orgId: session.orgId });

  if (error) {
    const { status, body } = CreateError.SDK(
      error,
      'An error ocurred retrieving your org information',
    );
    return res.status(status).json(body);
  }

  // eslint-disable-next-line prefer-const
  let [recipient, recipientError] = await DB.Users.getUserByEmail({
    email: recipientEmail,
  });

  if (recipientError) {
    const { status, body } = CreateError.SDK(
      error,
      "An error ocurred getting your invitee's information",
    );
    return res.status(status).json(body);
  }

  // Invite is for a user that doesn't exist
  if (!recipient) {
    const [createdUser, createUserError] = await DB.Users.createUser({
      email: recipientEmail,
    });

    if (createUserError) {
      const { status, body } = CreateError.SDK(
        createUserError,
        'An error ocurred creating an account for your invitee',
      );

      return res.status(status).json(body);
    }
    recipient = createdUser;
  }

  if (recipient.orgId === session.orgId) {
    return res.status(403).json({ message: 'User is already in your org!' });
  }

  // Check if the user we are inviting already has pending invites for the current org
  const [recipientInvites, recipientInvitesError] = await DB.Invites.getInvitesForUser({
    userId: recipient.userId,
  });

  if (recipientInvitesError) {
    const { status, body } = CreateError.SDK(
      recipientInvitesError,
      'An error ocurred while checking to see if your invitee has pending invites',
    );
    return res.status(status).json(body);
  }

  const pendingInvites = recipientInvites.some((invite) => invite.orgId === session.orgId);

  if (pendingInvites) {
    return res.status(403).json({
      message: 'This user already has a pending invite to your org! They can log in to claim it.',
    });
  }

  const [inviteCreated, inviteError] = await DB.Invites.createInvite({
    recipient: pick(recipient, ['userId', 'email', 'firstName', 'lastName', 'unsubscribeKey']),
    orgName: org.displayName,
    expiresAt: Time.futureISO(expiresInDays || ORG_INVITE_EXPIRY_DAYS, TIME_UNITS.DAYS), // TODO https://github.com/plutomi/plutomi/issues/333
    createdBy: pick(session, ['userId', 'firstName', 'lastName', 'orgId', 'email']),
  });

  if (inviteError) {
    const { status, body } = CreateError.SDK(inviteError, 'An error ocurred creating your invite');

    return res.status(status).json(body);
  }

  // Email sent asynchronously through step functions
  return res.status(201).json({ message: `Invite sent to '${recipientEmail}'` });
};
