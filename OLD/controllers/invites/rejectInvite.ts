// import { Request, Response } from 'express';
// import { InviteEntity, UserEntity } from '../../models';
// import { Filter, UpdateFilter } from 'mongodb';
// import { collections, mongoClient } from '../../utils/connectToDatabase';
// import { IndexableProperties } from '../../@types/indexableProperties';
// import { findInRelatedToArray } from '../../utils';

// export const rejectInvite = async (req: Request, res: Response) => {
//   const { inviteId } = req.params;
//   const { user } = req;

//   let invite: InviteEntity | undefined;
//   const inviteFilter: Filter<InviteEntity> = {
//     id: inviteId,
//     relatedTo: {
//       property: IndexableProperties.Email,
//       value: findInRelatedToArray(IndexableProperties.Email, user), // Can also get by ID
//     },
//   };
//   try {
//     invite = (await collections.invites.findOne(inviteFilter)) as InviteEntity;
//   } catch (error) {
//     const msg = 'An error ocurred finding that invite';
//     console.error(msg, error);
//     return res.status(500).json({ message: msg });
//   }

//   if (!invite) {
//     return res.status(404).json({ message: 'Invite not found! It may have already been deleted' });
//   }

//   const session = mongoClient.startSession();

//   let transactionResults;

//   try {
//     transactionResults = await session.withTransaction(async () => {
//       await collections.invites.deleteOne(inviteFilter, { session });

//       const userFilter: Filter<UserEntity> = {
//         id: user.id,
//       };
//       const userUpdate: UpdateFilter<UserEntity> = {
//         $inc: { totalInvites: -1 },
//       };
//       await collections.users.updateOne(userFilter, userUpdate, { session });
//       await session.commitTransaction();
//     });
//   } catch (error) {
//     const msg = 'An error ocurred rejecting that invite';
//     console.error(msg, error);
//     return res.status(500).json({ message: msg });
//   } finally {
//     await session.endSession();
//   }

//   return res.status(200).json({ message: 'Invite rejected!' });
// };
