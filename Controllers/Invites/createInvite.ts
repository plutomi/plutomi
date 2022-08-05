import { Request, Response } from 'express';
import Joi from 'joi';
import emailValidator from 'deep-email-validator';
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
import { IUser } from 'aws-cdk-lib/aws-iam';
import { User } from '../../entities/User';

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

  const validation = await emailValidator({
    email: recipientEmail,
    validateSMTP: false, // BUG, this isnt working
  });
  if (!validation.valid) {
    return res.status(400).json({
      message: ERRORS.EMAIL_VALIDATION,
    });
  }

  if (
    twoStringsMatch({
      string1: user.firstName,
      string2: recipientEmail,
    })
  ) {
    return res.status(403).json({ message: `You can't invite yourself` });
  }

  const userUsingDefaultName = nameIsDefault({
    firstName: user.firstName,
    lastName: user.lastName,
  });

  // if (userUsingDefaultName) {
  //   return res.status(403).json({
  //     message: `Please update your first and last name before sending invites to team members. You can do this at ${WEBSITE_URL}/profile`,
  //   });
  // }
  const [org, error] = await getOrg({ orgId: user.org });

  if (error) {
    const { status, body } = CreateError.SDK(
      error,
      'An error ocurred retrieving your org information',
    );
    return res.status(status).json(body);
  }

  if (!org) {
    return res.status(404).json({ message: 'Org does not exist' });
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
    const newUser = new User({
      email: recipientEmail,
    });

    try {
      await newUser.save();
    } catch (error) {
      return res.status(500).json({ message: 'An error ocurred creating the new user' });
    }

    recipient = newUser;
  }

  if (recipient.org === user.org) {
    return res.status(403).json({ message: 'User is already in your org!' });
  }

  // Check if the user we are inviting already has pending invites for the current org
  const [recipientInvites, recipientInvitesError] = await DB.Invites.getInvitesForUser({
    _id: recipient._id,
  });

  if (recipientInvitesError) {
    const { status, body } = CreateError.SDK(
      recipientInvitesError,
      'An error ocurred while checking to see if your invitee has pending invites',
    );
    return res.status(status).json(body);
  }

  const pendingInvites = recipientInvites.some((invite) => invite.orgId === user.org);

  if (pendingInvites) {
    return res.status(403).json({
      message: 'This user already has a pending invite to your org! They can log in to claim it.',
    });
  }

  // TODO this can get reworked with the new syncrhonous emails
  const [inviteCreated, inviteError] = await DB.Invites.createInvite({
    recipient: recipient, // TODO type is wrong
    orgName: org.displayName,
    expiresAt: Time.futureISO({
      amount: expiresInDays || ORG_INVITE_EXPIRY_DAYS,
      unit: TIME_UNITS.DAYS,
    }),
    createdBy: user, // TODO type is wrong
  });

  if (inviteError) {
    const { status, body } = CreateError.SDK(inviteError, 'An error ocurred creating your invite');

    return res.status(status).json(body);
  }

  res.status(201).json({ message: `Invite sent to '${recipientEmail}'` });

  const subject = userUsingDefaultName
    ? `You've been invited to join ${org.displayName} on Plutomi!`
    : `${user.firstName} ${user.lastName} has invited you to join them on ${org.displayName}`;
  try {
    await sendEmail({
      from: {
        header: `Plutomi`,
        email: Emails.JOIN,
      },
      to: recipient.email,
      subject,
      body: `<h4>You can log in at <a href="${WEBSITE_URL}" target="_blank" rel=noreferrer>${WEBSITE_URL}</a> to accept their invite!</h4><p>If you believe this email was received in error, you can safely ignore it.</p>`,
    });
    return;
  } catch (error) {
    console.error('Error ocurred inviting a user to an org', error);
  }
};
