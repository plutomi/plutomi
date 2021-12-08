import { getUserById } from "../utils/users/getUserById";
import { Request, Response } from "express";
import { DEFAULTS } from "../Config";
export const self = async (req: Request, res: Response) => {
  try {
    const requestedUser = await getUserById({
      userId: req.session.user.userId,
    });
    if (!requestedUser) {
      req.session.destroy();
      return res.status(401).json({
        message: `Please log in again`,
      }); // TODO enum error
    }

    return res.status(200).json(req.session.user);
  } catch (error) {
    // TODO add error logger
    return res
      .status(400) // TODO change #
      .json({ message: `${error}` });
  }
};

export const getById = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const requestedUser = await getUserById({ userId: userId });

    if (!requestedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check that the user who made this call is in the same org as the requested user
    // TODO RBAC here, users can view other user info if they're in the same org
    if (
      req.session.user.orgId === DEFAULTS.NO_ORG || // Block users not in an org from being able to view other users
      req.session.user.orgId != requestedUser.orgId
    ) {
      return res
        .status(403)
        .json({ message: "You are not authorized to view this user" });
    }
    return res.status(200).json(requestedUser);
  } catch (error) {
    // TODO add error logger
    return res
      .status(400) // TODO change #
      .json({ message: `${error}` });
  }
};
