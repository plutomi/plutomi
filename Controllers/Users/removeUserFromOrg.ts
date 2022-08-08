import { Request, Response } from 'express';
import * as CreateError from '../../utils/createError';
import { DB } from '../../models';
import { Schema } from 'mongoose';
import { Org } from '../../entities/Org';
import { DEFAULTS } from '../../Config';
import { User } from '../../entities/User';

export const removeUserFromOrg = async (req: Request, res: Response) => {
  const { user } = req;
  const { orgId, userId } = req.params;

  // TODO types
  if ((userId as unknown as Schema.Types.ObjectId) === user._id) {
    return res.status(403).json({
      message:
        "You cannot remove yourself from an org. If you're the only user, delete the org instead",
    });
  }

  try {
    const org = await Org.findById(user.org);

    if (!org) {
      return res.status(404).json({ message: 'Org not found' });
    }

    // TODO update user

    // TODO needs transaction
    try {
      await User.updateOne(
        {
          _id: user._id,
        },
        {
          $set: {
            org: DEFAULTS.NO_ORG,
          },
        },
      );

      try {
        await Org.updateOne(
          {
            _id: org._id,
          },
          {
            $inc: {
              totalApplicants: -1,
            },
          },
        );
        return res.status(200).json({ message: 'User removed from org!' });
      } catch (error) {
        return res
          .status(500)
          .json({ message: 'An error ocurred decrementing the totalUsers property on org' });
      }
    } catch (error) {
      return res.status(500).json({ message: 'An error ocurred updating orgId for user' });
    }

    // TODO decrement total users in or
  } catch (error) {
    return res.status(500).json({ message: 'An error ocurred retrieving org info' });
  }
};
