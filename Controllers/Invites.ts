import { Request, Response } from "express";
import Joi from "joi";
import {
  DEFAULTS,
  EMAILS,
  ENTITY_TYPES,
  FORBIDDEN_PROPERTIES,
  TIME_UNITS,
} from "./../Config";
import Sanitize from "./../utils/sanitize";
import * as Invites from "../models/Invites/index";
import * as Time from "./../utils/time";
import * as Users from "../models/Users/index";
import * as Orgs from "../models/Orgs/index";
import errorFormatter from "../utils/errorFormatter";
const UrlSafeString = require("url-safe-string"),
  tagGenerator = new UrlSafeString();
export const accept = async (req: Request, res: Response) => {
  const { inviteId } = req.params;

  if (req.session.user.orgId !== DEFAULTS.NO_ORG) {
    return res.status(400).json({
      message: `You already belong to an org: ${req.session.user.orgId} - delete it before joining another one!`,
    });
  }

  const [invite, error] = await Invites.getInviteById({
    inviteId: inviteId,
    userId: req.session.user.userId,
  });

  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(formattedError.httpStatusCode).json({
      message: "An error ocurred getting the info for your invite",
      ...formattedError,
    });
  }

  if (!invite) {
    return res.status(400).json({ message: `Invite no longer exists` });
  }

  const [joined, joinError] = await Invites.joinOrgFromInvite({
    userId: req.session.user.userId,
    invite,
  });

  if (joinError) {
    const formattedError = errorFormatter(joinError);
    return res.status(formattedError.httpStatusCode).json({
      message: "We were unable to join that org",
      ...formattedError,
    });
  }

  const [updatedUser, updatedUserFailure] = await Users.getUserById({
    userId: req.session.user.userId,
  });

  if (updatedUserFailure) {
    const formattedError = errorFormatter(updatedUserFailure);
    return res.status(formattedError.httpStatusCode).json({
      message:
        "We were able to succesfully join the org, but we were unable to update your session. Please log out and log in again!",
      ...formattedError,
    });
  }
  req.session.user = Sanitize("REMOVE", FORBIDDEN_PROPERTIES.USER, updatedUser);
  await req.session.save();
  return res
    .status(200)
    .json({ message: `You've joined the ${invite.orgName} org!` });
};

export const reject = async (req: Request, res: Response) => {
  const { inviteId } = req.params;

  const [deleted, error] = await Invites.deleteInvite({
    inviteId: inviteId,
    userId: req.session.user.userId,
  });

  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(formattedError.httpStatusCode).json({
      message: "We were unable to delete that invite",
      ...formattedError,
    });
  }
  req.session.user.totalInvites -= 1;
  await req.session.save();
  return res.status(200).json({ message: "Invite rejected!" }); // TODO enum for RESPONSES
};
