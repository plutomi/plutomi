// import { Request, Response } from 'express';
// import Joi from 'joi';
// import { JOI_SETTINGS, JoiOrgId } from '../../Config';
// import { Filter, UpdateFilter } from 'mongodb';
// import { OrgEntity, UserEntity } from '../../models';
// import { collections } from '../../utils/connectToDatabase';
// import { IndexableProperties } from '../../@types/indexableProperties';
// import { mongoClient } from '../../utils/connectToDatabase';
// import { findInRelatedToArray } from '../../utils/findInRelatedToArray';
// interface aa {
//   orgId: string;
//   displayName: string;
// }
// // TODO sigh
// export type APICreateOrgOptions = aa;

// const schema = Joi.object({
//   body: {
//     orgId: JoiOrgId,
//     displayName: Joi.string(),
//   },
// }).options(JOI_SETTINGS);

// export const createAndJoinOrg = async (req: Request, res: Response) => {
//   const { user } = req;
//   try {
//     await schema.validateAsync(req);
//   } catch (error) {
//     return res.status(400).json({ message: 'An error ocurred', error });
//   }

//   const { orgId: currentUserOrg } = user;
//   if (user.orgJoinDate || currentUserOrg) {
//     return res.status(403).json({ message: 'You already belong to an org!' });
//   }

//   // TODO get pending invites!!!!!!!!!!
//   // const [pendingInvites, error] = await getInvitesForUser({
//   //   userId: user.userId,
//   // });

//   // if (error) {
//   //   const { status, body } = CreateError.SDK(
//   //     error,
//   //     'Unable to create org - error retrieving invites',
//   //   );

//   //   return res.status(status).json(body);
//   // }

//   // if (pendingInvites && pendingInvites.length > 0) {
//   //   return res.status(403).json({
//   //     message:
//   //       'You seem to have pending invites, please accept or reject them before creating an org :)',
//   //   });
//   // }

//   const { displayName, orgId }: APICreateOrgOptions = req.body;

//   let org: OrgEntity | null;

//   const orgFilter: Filter<OrgEntity> = {
//     id: orgId,
//   };
//   try {
//     org = (await collections.orgs.findOne(orgFilter)) as OrgEntity;
//   } catch (error) {
//     const msg = `Error ocurred checking if that org already exists`;
//     console.error(msg, error);
//     return res.status(500).json({ msg, error });
//   }

//   if (org) {
//     return res.status(403).json({
//       message: `An org already exists with this ID ('${orgId}'), please choose another!`,
//     });
//   }

//   const userFilter: Filter<UserEntity> = {
//     id: user.id,
//   };
//   const userUpdateFilter: UpdateFilter<UserEntity> = {
//     $set: { orgId, orgJoinDate: new Date() },
//   };

//   const session = mongoClient.startSession();

//   let transactionResults;
//   try {
//     transactionResults = await session.withTransaction(async () => {
//       await collections.users.updateOne(userFilter, userUpdateFilter, {
//         session,
//       });

//       const now = new Date();
//       const newOrg: OrgEntity = {
//         id: orgId.trim().toLowerCase(),
//         createdAt: now,
//         updatedAt: now,
//         totalStages: 0,
//         totalOpenings: 0,
//         totalApplicants: 0,
//         totalQuestions: 0,
//         totalUsers: 1,
//         totalWebhooks: 0,
//         createdBy: user.id,
//         relatedTo: [],
//         displayName,
//       };
//       await collections.orgs.insertOne(newOrg, { session });

//       await session.commitTransaction();
//     });
//   } catch (error) {
//     const msg = 'Error ocurred joining org';
//     console.error(msg, error);
//     return res.status(500).json({ message: msg });
//   } finally {
//     await session.endSession();
//   }

//   console.log(transactionResults);
//   return res.status(201).json({ message: 'Org created!' });
// };
