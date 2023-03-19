// import { Request, Response } from 'express';
// import Joi from 'joi';
// import { JOI_SETTINGS } from '../../Config';
// import { findInTargetArray } from '../../utils/findInTargetArray';

// interface APIGetUserByIdParameters {
//   userId?: string;
// }

// const schema = Joi.object({
//   params: {
//     userId: Joi.string(),
//   },
// }).options(JOI_SETTINGS);

// export const getUser = async (req: Request, res: Response) => {
//   const { user } = req;
//   try {
//     await schema.validateAsync(req);
//   } catch (error) {
//     return res.status(400).json({ message: 'An error ocurred', error });
//   }
//   return res.status(200).json({ message: 'Endpoint temp disabled' });

//   // const { userId }: APIGetUserByIdParameters = req.params;
//   // if (user.id !== userId) {
//   //   // TODO RBAC
//   //   return res.status(403).json({
//   //     message: 'You are not authorized to view this user',
//   //   });
//   // }

//   // const [requestedUser, error] = await DB.Users.getUserById({
//   //   userId,
//   // });

//   // if (error) {
//   //   const { status, body } = CreateError.SDK(error, 'An error ocurred retrieving user info by id');

//   //   return res.status(status).json(body);
//   // }
//   // if (!requestedUser) {
//   //   return res.status(404).json({ message: 'User not found' });
//   // }

//   // // TODO RBAC here
//   // // Only allow viewing users in the same org
//   // const orgId = findInTargetArray({ entity: IdxTypes.Org, targetArray: user.target });
//   // if (orgId !== requesteduser.org) {
//   //   return res.status(403).json({
//   //     message: 'You are not authorized to view this user since you are not in the same org',
//   //   });
//   // }

//   // return res.status(200).json(requestedUser);
// };
