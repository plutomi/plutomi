// import { Request, Response } from 'express';
// import Joi from 'joi';
// import { Emails, JOI_SETTINGS, WEBSITE_URL } from '../../Config';
// import {
//   AllEntityNames,
//   EntityPrefix,
//   findInRelatedToArray,
//   generatePlutomiId,
//   sendEmail,
// } from '../../utils';
// import { IndexableProperties } from '../../@types/indexableProperties';
// import { OrgEntity, UserEntity } from '../../models';
// import { Filter, UpdateFilter } from 'mongodb';
// import dayjs from 'dayjs';
// import { InviteEntity } from '../../models/Invites';

// const schema = Joi.object({
//   body: {
//     recipientEmail: Joi.string().email().trim(),
//     expiresInDays: Joi.number().min(1).max(365),
//   },
// }).options(JOI_SETTINGS);

// export const createInvite = async (req: Request, res: Response) => {
//   try {
//     await schema.validateAsync(req);
//   } catch (error) {
//     return res.status(400).json({ message: 'An error ocurred', error });
//   }

//   const { user } = req;
//   const senderHasBothNames = user.firstName && user.lastName;
//   const { recipientEmail, expiresInDays } = req.body;
//   const userEmail = findInRelatedToArray(IndexableProperties.Email, user); // TODO update this
//   const { org: userOrgId } = user;

//   if (!userOrgId) {
//     return res.status(404).json({ message: 'You must belong to an org to invite other users' });
//   }

//   if (recipientEmail === findInRelatedToArray(IndexableProperties.Email, user)) {
//     return res.status(403).json({ message: 'You cannot invite yourself :)' });
//   }
//   const orgFilter: Filter<OrgEntity> = {
//     id: userOrgId,
//   };

//   let orgInfo: OrgEntity | undefined;
//   try {
//     orgInfo = (await req.db.findOne(orgFilter)) as OrgEntity;
//   } catch (error) {
//     const msg = 'An error ocurred finding info for that org';
//     console.error(msg, error);
//     return res.status(500).json({ message: 'An error ocurred returning org info' });
//   }

//   // Not sure how this would happen
//   if (!orgInfo) {
//     return res.status(404).json({ message: 'Org not found!' });
//   }

//   let recipient: UserEntity | undefined;

//   const recipientFilter: Filter<UserEntity> = {
//     // !TODO: Not type safe!!!
//     relatedTo: { property: IndexableProperties.Email, value: recipientEmail },
//   };

//   try {
//     recipient = (await req.db.findOne(recipientFilter)) as UserEntity;
//   } catch (error) {
//     const msg = 'An error ocurred sending that invite';
//     console.error(msg, error);
//     return res.status(500).json({ message: msg });
//   }

//   const now = new Date();

//   /**
//    * If there is no recipient, let's create one
//    */

//   if (!recipient) {
//     console.log('Recipient not found');
//     // Invite is for a user that doesn't exist
//     const userId = generatePlutomiId({ date: now, entityPrefix: EntityPrefix.User });
//     const newUser: UserEntity = {
//       id: userId,
//       createdAt: now,
//       updatedAt: now,
//       org: null,
//       totalInvites: 0, // Will be incremented in a transaction below
//       firstName: null,
//       lastName: null,
//       emailVerified: false,
//       canReceiveEmails: true,
//       relatedTo: [
//         { id: AllEntityNames.User, type: IndexableProperties.Entity },
//         { id: userId, type: IndexableProperties.Id },
//         { id: recipientEmail, type: IndexableProperties.Email },
//       ],
//     };

//     try {
//       await req.db.insertOne(newUser);
//       recipient = newUser;
//     } catch (error) {
//       const msg = `An error ocurred creating that user's account`;
//       console.error(msg, error);
//       return res.status(500).json({ message: msg });
//     }
//   }

//   const { org: recipientOrgId } = recipient;
//   if (recipientOrgId === userOrgId) {
//     return res.status(403).json({ message: 'User is already in your org!' });
//   }

//   const recipientHasBothNames = recipient.firstName && recipient.lastName;
//   // Now let's create an invite
//   const newInviteDate = new Date();
//   const newInviteId = generatePlutomiId({ date: newInviteDate, entityPrefix: EntityPrefix.Invite });
//   const newInvite: InviteEntity = {
//     id: newInviteId,
//     org: orgInfo.id,
//     userId: recipient.id,
//     orgName: orgInfo.displayName,
//     createdAt: now,
//     updatedAt: now,
//     recipientName: recipientHasBothNames ? `${recipient.firstName} ${recipient.lastName}` : null,
//     createdBy: {
//       name: senderHasBothNames ? `${user.firstName} ${user.lastName}` : null,
//       email: userEmail,
//     },
//     expiresAt: dayjs(now).add(expiresInDays, 'days').toDate(),
//     relatedTo: [
//       { id: AllEntityNames.Invite, type: IndexableProperties.Entity },
//       { id: newInviteId, type: IndexableProperties.Id },
//       { id: recipientEmail, type: IndexableProperties.Email },
//       {
//         id: recipient.id,
//         type: IndexableProperties.User,
//       },
//     ],
//   };

//   // Check if the user already has a pending invite for the org they are being invited to
//   const invitesFilter: Filter<InviteEntity> = {
//     orgId: userOrgId,
//     relatedTo: { property: IndexableProperties.Email, value: recipientEmail },
//   };
//   const currentInvite = await req.db.findOne(invitesFilter);
//   if (currentInvite) {
//     return res.status(403).json({
//       message: 'This user already has a pending invite for your org, they can log in to claim it',
//     });
//   }

//   // Create invite and increment the user's total invites
//   const session = req.client.startSession();
//   let transactionResults;

//   try {
//     transactionResults = await session.withTransaction(async () => {
//       const recipientUpdateFilter: UpdateFilter<UserEntity> = {
//         $inc: { totalInvites: 1 },
//       };
//       await req.db.updateOne(recipientFilter, recipientUpdateFilter, { session });
//       await req.db.insertOne(newInvite, { session });
//       await session.commitTransaction();
//     });
//   } catch (error) {
//     const msg = 'An error ocurred creating that invite';
//     console.error(msg, error);
//     return res.status(500).json({ message: msg });
//   } finally {
//     await session.endSession();
//   }

//   res
//     .status(201)
//     .json({ message: `Invite sent to '${recipientEmail}'! They can log in to claim it.` });

//   const subject = senderHasBothNames
//     ? `${user.firstName} ${user.lastName} has invited you to join them on ${orgInfo.displayName}`
//     : `You've been invited to join ${orgInfo.displayName} on Plutomi!`;

//   try {
//     await sendEmail({
//       from: {
//         header: `Plutomi`,
//         email: Emails.Join,
//       },
//       to: recipientEmail,
//       subject,
//       body: `<h4>You can log in at <a href="${WEBSITE_URL}" target="_blank" rel=noreferrer>${WEBSITE_URL}</a> to accept the invite!</h4><p>If you believe this email was received in error, you can safely ignore it.</p>`,
//     });
//     return;
//   } catch (error) {
//     console.error('Error ocurred inviting a user to an org', error);
//   }
// };
