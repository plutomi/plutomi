import { Request, Response } from "express";
import { DEFAULTS, ENTITY_TYPES } from "./../Config";
import * as Users from "../models/Users/index";
import Joi from "joi";
import errorFormatter from "../utils/errorFormatter";

export const update = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { newValues } = req.body;

  // TODO RBAC will go here, right now you can only update yourself
  if (userId !== req.session.user.userId) {
    return res.status(403).json({ message: "You cannot update another user" });
  }

  const updateUserInput = {
    userId: req.session.user.userId,
    ALLOW_FORBIDDEN_KEYS: false,
    newValues,
  };

  const schema = Joi.object({
    userId: Joi.string(),
    ALLOW_FORBIDDEN_KEYS: Joi.boolean().invalid(true),
    newValues: Joi.object({
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

  const [updatedUser, error] = await Users.updateUser(updateUserInput);

  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(formattedError.httpStatusCode).json({
      message: "An error ocurred updating user info",
      ...formattedError,
    });
  }
  // If a signed in user is updating themselves, update the session state as well
  if (updatedUser.userId === req.session.user.userId) {
    // req.session.user = Sanitize.clean(updatedUser, ENTITY_TYPES.USER);
    await req.session.save();
  }
  return res.status(200).json({ message: "Updated!" });
};

export const getInvites = async (req: Request, res: Response) => {
  const [invites, error] = await Users.getInvitesForUser({
    userId: req.session.user.userId,
  });

  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(formattedError.httpStatusCode).json({
      message: "An error ocurred retrieving invites",
      ...formattedError,
    });
  }

  return res.status(200).json(invites);
};
