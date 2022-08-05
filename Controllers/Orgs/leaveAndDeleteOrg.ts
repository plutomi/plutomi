import { Request, Response } from 'express';
import { DEFAULTS } from '../../Config';
import { Org } from '../../entities/Org';
import { User } from '../../entities/User';
import { DB } from '../../models';
import * as CreateError from '../../utils/createError';

export const leaveAndDeleteOrg = async (req: Request, res: Response) => {
  const { user } = req;
  try {
    const org = await Org.findById(user.orgId);
    if (!org) {
      // Not sure how this would happen
      return res.status(404).json({ message: 'Org does not exist' });
    }

    if (org.totalUsers > 1) {
      return res.status(403).json({
        message: 'You cannot delete this org as there are other users in it',
      });
    }

    try {
      await Org.deleteOne({
        _id: org.id,
      });

      try {
        await User.updateOne(
          { _id: user._id },
          {
            $set: {
              orgId: DEFAULTS.NO_ORG,
              orgJoinDate: undefined,
            },
          },
        );
        return res.status(200).json({ message: 'Org deleted!' });
      } catch (error) {
        return res.status(500).json({ message: 'Error ocurred updating user with deleted org' });
      }
    } catch (error) {
      return res.status(500).json({ message: 'Error ocurred deleting org' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'An error ocurred retrieving org info' });
  }
};
