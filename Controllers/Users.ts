import { getUserById } from "../utils/users/getUserById";
import { Request, Response } from "express";
import { DEFAULTS, ENTITY_TYPES } from "../Config";
import Joi from "joi";
import { updateUser } from "../utils/users/updateUser";
import Sanitize from "../utils/sanitize";
import { getOrgInvitesForUser } from "../utils/invites/getOrgInvitesForUser";
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

export const update = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { newUserValues } = req.body;
  const updateUserInput = {
    userId: req.session.user.userId,
    ALLOW_FORBIDDEN_KEYS: false,
    newUserValues: newUserValues,
  };

  const schema = Joi.object({
    userId: Joi.string(),
    ALLOW_FORBIDDEN_KEYS: Joi.boolean().invalid(true),
    newUserValues: Joi.object({
      firstName: Joi.string().invalid(DEFAULTS.FIRST_NAME).optional(),
      lastName: Joi.string().invalid(DEFAULTS.LAST_NAME).optional(),
      GSI1SK: Joi.string().invalid(DEFAULTS.FULL_NAME).optional(),
    }),
  }).options({ presence: "required" });

  // Validate input
  try {
    await schema.validateAsync(updateUserInput);
  } catch (error) {
    return res.status(400).json({ message: `${error.message}` });
  }

  try {
    // TODO RBAC will go here, right now you can only update yourself
    if (userId != req.session.user.userId) {
      return res
        .status(403)
        .json({ message: "You cannot update another user" });
    }

    const updatedUser = await updateUser(updateUserInput);

    // If a signed in user is updating themselves, update the session state
    if (updatedUser.userId === req.session.user.userId) {
      req.session.user = Sanitize.clean(updatedUser, ENTITY_TYPES.USER);
      await req.session.save();
    }
    return res.status(200).json({ message: "Updated!" });
  } catch (error) {
    // TODO add error logger
    // TODO get correct status code
    return res.status(500).json({ message: `${error}` });
  }
};

export const getInvites = async (req: Request, res: Response) => {
  try {
    const invites = await getOrgInvitesForUser({
      userId: req.session.user.userId,
    });
    return res.status(200).json(invites);
  } catch (error) {
    // TODO add error logger
    return res
      .status(400) // TODO change #
      .json({ message: `${error}` });
  }
};
