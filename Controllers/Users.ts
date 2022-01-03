import { Request, Response } from "express";
import { DEFAULTS, ENTITY_TYPES } from "./../Config";
import * as Users from "../models/Users/index";
import errorFormatter from "../utils/errorFormatter";

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
