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
import { Org } from '../../entities/Org';
import { OrgInvite } from '../../entities/OrgInvite';
import dayjs from 'dayjs';

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

  try {
    const org = await Org.findById(user.org);

    if (!org) {
      return res.status(404).json({ message: 'Org does not exist' });
    }

    // HERE AND BELOW
    try {
      let recipient = await User.findOne({
        email: recipientEmail,
      });

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

      // Check if the recipient already has a pending invite to this org

      try {
        const pendingInvite = await OrgInvite.findOne({
          recipient,
          org: user.org,
        });

        if (pendingInvite) {
          return res
            .status(403)
            .json({ message: 'This user already has a pending invite to your org!' });
        }

        try {
          const newInvite = new OrgInvite({
            org: user.org,
            createdBy: user,
            recipient,
            expiresAt: dayjs(new Date()).add(expiresInDays, 'days').toDate(),
          });

          await newInvite.save();
          // TODO TRANSACTION!!!!!!!!!!!
          try {
            await User.updateOne(
              { _id: user._id },
              {
                $inc: {
                  totalInvites: 1,
                },
              },
            );

            const subject = userUsingDefaultName
              ? `You've been invited to join ${org.name} on Plutomi!`
              : `${user.firstName} ${user.lastName} has invited you to join them on ${org.name}`;
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
              return res.status(201).json({ message: `Invite sent to '${recipientEmail}'` });
            } catch (error) {
              return res.status(500).json({
                message:
                  'Invite created in DB but failed to send to email to user. They can log in to claim it!',
              });
            }
          } catch (error) {
            return res
              .status(500)
              .json({ message: 'Unable to increment totalInvites property on recipient' });
          }
        } catch (error) {
          return res
            .status(500)
            .json({ message: 'An error ocurred creating the invite for that user' });
        }
      } catch (error) {
        return res.status(500).json({
          message:
            'An error ocurred checking if the recipient already has pending invites to your org',
        });
      }
    } catch (error) {
      return res
        .status(500)
        .json({ message: 'An error ocurred checking if that recipient exists' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'An error ocurred getting org info' });
  }
};
