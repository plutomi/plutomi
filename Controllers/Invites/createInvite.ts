import { Request, Response } from 'express';
import Joi from 'joi';
import emailValidator from 'deep-email-validator';
import { pick } from 'lodash';
import {
  Defaults,
  Emails,
  ERRORS,
  JOI_SETTINGS,
  ORG_INVITE_EXPIRY_DAYS,
  TIME_UNITS,
  WEBSITE_URL,
} from '../../Config';
import { findInTargetArray, generateId, sendEmail } from '../../utils';
import { IndexableProperties } from '../../@types/indexableProperties';
import { OrgEntity, UserEntity } from '../../models';
import { collections } from '../../utils/connectToDatabase';
import { Filter, UpdateFilter } from 'mongodb';
import dayjs from 'dayjs';
import { InviteEntity } from '../../models/Invites';

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
    return res.status(400).json({ message: 'An error ocurred', error });
  }

  const { user } = req;
  const senderHasBothNames = user.firstName && user.lastName;
  const { recipientEmail, expiresInDays } = req.body;

  const userOrgId = findInTargetArray(IndexableProperties.Org, req.user);
  if (!userOrgId) {
    return res.status(404).json({ message: 'You must belong to an org to invite other users' });
  }

  const orgFilter: Filter<OrgEntity> = {
    id: userOrgId,
  };

  let orgInfo: OrgEntity | undefined;
  try {
    orgInfo = (await collections.orgs.findOne(orgFilter)) as OrgEntity;
  } catch (error) {
    const msg = 'An error ocurred finding info for that org';
    console.error(msg, error);
    return res.status(500).json({ message: 'An error ocurred returning org info' });
  }

  // Not sure how this would happen
  if (orgInfo) {
    return res.status(404).json({ message: 'Org not found!' });
  }

  let recipient: UserEntity | undefined;

  const recipientFilter: Filter<UserEntity> = {
    target: { property: IndexableProperties.Email, value: recipientEmail },
  };

  try {
    recipient = (await collections.users.findOne(recipientFilter)) as UserEntity;
  } catch (error) {
    const msg = 'An error ocurred sending that invite';
    console.error(msg, error);
    return res.status(500).json({ message: msg });
  }

  const now = new Date();

  /**
   * If there is no recipient, let's create one
   */

  if (!recipient) {
    // Invite is for a user that doesn't exist
    const newUser: UserEntity = {
      id: generateId({}),
      createdAt: now,
      updatedAt: now,
      totalInvites: 1,
      firstName: null,
      lastName: null,
      emailVerified: false,
      canReceiveEmails: true,
      target: [
        { property: IndexableProperties.Org, value: null },
        { property: IndexableProperties.Email, value: recipientEmail },
      ],
    };

    try {
      recipient = newUser;
    } catch (error) {
      const msg = `An error ocurred inviting that user`;
      console.error(msg, error);
      return res.status(500).json({ message: msg });
    }
  }

  // Now let's create an invite
  const invite: InviteEntity = {
    orgName: orgInfo.displayName,
    createdAt: now,
    updatedAt: now,
    id: generateId({ fullAlphabet: true }),
    invitedByName: senderHasBothNames ? `${user.firstName} ${user.lastName}` : null,
    expiresAt: dayjs(now).add(expiresInDays, 'days').toDate(),
    target: [
      { property: IndexableProperties.Org, value: orgInfo.id },
      { property: IndexableProperties.Email, value: recipientEmail },
    ],
  };

  const recipientOrgId = findInTargetArray(IndexableProperties.Org, recipient);
  if (recipientOrgId === userOrgId) {
    return res.status(403).json({ message: 'User is already in your org!' });
  }

  // Check if the user already has a pending invite for the org they are being invited to

  // TODO update total invites on the user to 1!!!!!
  const invitesFilter: Filter<InviteEntity> = {
    $and: [
      { target: { property: IndexableProperties.Org, value: userOrgId } },
      { target: { property: IndexableProperties.Email, value: recipientEmail } },
    ],
  };
  const currentInvites = await collections.invites.findOne(invitesFilter);
  if (currentInvites) {
    return res.status(403).json({
      message: 'This user already has a pending invite for your org, they can log in to claim it',
    });
  }



// Create invite and increment the user's total invites

    try {
      const recipientUpdateFilter: UpdateFilter<UserEntity> = {
        $inc: { totalInvites: 1 },
      };
      await collections.users.updateOne(recipientFilter, recipientUpdateFilter);
      res.status(201).json({ message: 'Invite sent! They can log in to claim it.' });
    } catch (error) {
      const msg = 'An error ocurred sending the invite to the user';
      console.error(msg, error);
      return res.status(500).json({ message: msg });
    }
  }
  res.status(201).json({ message: `Invite sent to '${recipientEmail}'` });

  const subject = senderHasBothNames
    ? `You've been invited to join ${orgInfo.displayName} on Plutomi!`
    : `${user.firstName} ${user.lastName} has invited you to join them on ${orgInfo.displayName}`;

  try {
    await sendEmail({
      from: {
        header: `Plutomi`,
        email: Emails.JOIN,
      },
      to: recipientEmail,
      subject,
      body: `<h4>You can log in at <a href="${WEBSITE_URL}" target="_blank" rel=noreferrer>${WEBSITE_URL}</a> to accept their invite!</h4><p>If you believe this email was received in error, you can safely ignore it.</p>`,
    });
    return;
  } catch (error) {
    console.error('Error ocurred inviting a user to an org', error);
  }
};
