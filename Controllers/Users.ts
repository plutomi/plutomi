import { Request, Response } from "express";
import { DEFAULTS, ENTITY_TYPES } from "./../Config";
import Sanitize from "./../utils/sanitize";
import * as Users from "../models/Users/index";
import Joi from "joi";
import errorFormatter from "../utils/errorFormatter";
import genUnsubHash from "../utils/genUnsubHash";
export const self = async (req: Request, res: Response) => {
  const [user, error] = await Users.getUserById({
    userId: req.session.user.userId,
  });

  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(formattedError.httpStatusCode).json({
      message: "An error ocurred retrieving self info",
      ...formattedError,
    });
  }

  if (!user) {
    req.session.destroy();
    return res.status(401).json({
      message: `Please log in again`,
    });
  }

  return res.status(200).json(user);
};

export const getById = async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (
    // Block users who arenot in an org from being able to view other users before making the Dynamo call
    req.session.user.orgId === DEFAULTS.NO_ORG
  ) {
    return res
      .status(403)
      .json({ message: "You are not authorized to view this user" });
  }

  const [requestedUser, error] = await Users.getUserById({ userId });

  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(formattedError.httpStatusCode).json({
      message: "An error ocurred retrieving user info by id",
      ...formattedError,
    });
  }
  if (!requestedUser) {
    return res.status(404).json({ message: "User not found" });
  }

  // TODO RBAC here
  // Only allow viewing users in the same org
  if (req.session.user.orgId !== requestedUser.orgId) {
    return res
      .status(403)
      .json({ message: "You are not authorized to view this user" });
  }

  return res.status(200).json(requestedUser);
};

export const update = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { newUserValues } = req.body;

  // TODO RBAC will go here, right now you can only update yourself
  if (userId !== req.session.user.userId) {
    return res.status(403).json({ message: "You cannot update another user" });
  }

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
    req.session.user = Sanitize.clean(updatedUser, ENTITY_TYPES.USER);
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

export const unsubscribe = async (req: Request, res: Response) => {
  const clientHash = req.params.hash;
  const email = req.query.email as string;

  if (!clientHash || !email) {
    return res.status(400).json({ message: "Invalid link1" });
  }
  const [user, error] = await Users.getUserByEmail({ email });

  if (!user) {
    return res.status(400).json({ message: "Invalid link2" });
  }

  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(formattedError.httpStatusCode).json({
      message: "An error ocurred retrieving user info",
      ...formattedError,
    });
  }

  if (!user.canReceiveEmails) {
    return res.status(200).json({
      message:
        "You've already unsubscribed! Please reach out to support@plutomi.com to opt back in to emails",
    });
  }

  if (clientHash !== user.unsubscribeHash) {
    return res.status(400).json({ message: "Invalid link3" });
  }

  const [unsubbed, failed] = await Users.updateUser({
    userId: user.userId,
    ALLOW_FORBIDDEN_KEYS: true,
    newUserValues: {
      canReceiveEmails: false,
    },
  });

  if (failed) {
    const formattedError = errorFormatter(failed);
    return res.status(formattedError.httpStatusCode).json({
      message: "An error ocurred while unsubscribing",
      ...formattedError,
    });
  }
  return res.status(200).json({ message: "Unsubscribed!" });
};
