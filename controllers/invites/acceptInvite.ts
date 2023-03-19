// import { Request, Response } from 'express';
// import { Filter, UpdateFilter } from 'mongodb';
// import { IndexableProperties } from '../../@types/indexableProperties';
// import { Defaults } from '../../Config';
// import { InviteEntity, OrgEntity, UserEntity } from '../../models';
// import { findInTargetArray } from '../../utils';

// export const acceptInvite = async (req: Request, res: Response) => {
//   const { inviteId } = req.params;
//   const { user } = req;

//   const { org } = user;

//   if (org) {
//     return res.status(403).json({
//       message: `You already belong to an org: ${org} - delete it before joining another one!`,
//     });
//   }

//   let invite: InviteEntity | undefined;

//   const inviteFilter: Filter<InviteEntity> = {
//     id: inviteId,
//     $and: [ // ! TODO: Replace with elemmatch
//       { target: { property: IndexableProperties.User, value: user.id } },
//       {
//         // This is redundant but :)
//         target: {
//           property: IndexableProperties.Email,
//           value: findInTargetArray(IndexableProperties.Email, user),
//         },
//       },
//     ],
//   };
//   try {
//     invite = (await req.db.findOne(inviteFilter)) as InviteEntity;
//   } catch (error) {
//     const msg = 'An error ocurred finding invite info';
//     console.error(msg, error);
//   }

//   if (!invite) {
//     return res.status(404).json({ message: 'Invite not found!' });
//   }

//   const { org: inviteorg } = invite;

//   let deleteInvite = false;
//   /**
//    * Not sure how this would happen as we do a check before the invite is sent to prevent this...
//    */
//   if (inviteorg === org) {
//     deleteInvite = true;
//     res.status(400).json({ message: "It appears that you're already in this org!" });
//   }

//   const now = new Date();
//   if (invite.expiresAt <= now && !deleteInvite) {
//     // We need the delete invite check so we don't have two res.sends just in case
//     deleteInvite = true;
//     res.status(403).json({
//       message: 'It looks like that invite has expired, ask the org admin to send you another one!',
//     });
//   }

//   const session = req.client.startSession();

//   let transactionResults;

//   try {
//     const { org } = invite;
//     transactionResults = await session.withTransaction(async () => {
//       await req.db.deleteOne(inviteFilter, { session });

//       const userFilter: Filter<UserEntity> = {
//         id: user.id,
//         org: null,
//       };
//       const userUpdate: UpdateFilter<UserEntity> = {
//         $inc: { totalInvites: -1 },
//         $set: {
//           org,
//           orgJoinDate: now,
//         },
//       };

//       await req.db.updateOne(userFilter, userUpdate, { session });

//       const orgFilter: Filter<OrgEntity> = {
//         id: org,
//       };

//       const orgUpdate: UpdateFilter<OrgEntity> = {
//         $inc: { totalUsers: 1 },
//       };

//       await req.db.updateOne(orgFilter, orgUpdate, { session });
//       await session.commitTransaction();
//     });
//   } catch (error) {
//     const msg = 'An error ocurred accepting that invite';
//     console.error(msg, error);
//     return res.status(500).json({ message: msg });
//   } finally {
//     await session.endSession();
//   }
//   return res.status(200).json({ message: 'Invite accepted!' });
// };
