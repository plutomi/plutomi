import {
  DEFAULTS,
  DOMAIN_NAME,
  EMAILS,
  ENTITY_TYPES,
  LOGIN_METHODS,
  TIME_UNITS,
} from "../Config";
import { Request, Response } from "express";
import { sealData, unsealData } from "iron-session";
import { nanoid } from "nanoid";
import { CUSTOM_QUERY } from "../types/main";
import Sanitize from "../utils/sanitize";
import Joi from "joi";
import * as Time from "../utils/time";
import * as Users from "../models/Users/index";
import { LOGIN_LINK_SETTINGS } from "../Config";
import errorFormatter from "../utils/errorFormatter";
export const login = async (req: Request, res: Response) => {
  const { callbackUrl, seal } = req.query as Pick<
    CUSTOM_QUERY,
    "callbackUrl" | "userId" | "seal"
  >;

  if (!seal) {
    return res.status(400).json({ message: "Invalid seal" });
  }

  // Validates the login link when clicked
  const { userId, loginLinkId }: { userId: string; loginLinkId: string } =
    await unsealData(
      // TODO types, // TODO try catch
      seal,
      LOGIN_LINK_SETTINGS
    );

  // If the link expired, these will be undefined
  if (!userId || !loginLinkId) {
    return res.status(401).json({ message: "Your link is invalid" });
  }

  const [user, error] = await Users.getUserById({ userId }); // TODO async error handling

  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(formattedError.httpStatusCode).json({
      message: "An error ocurred getting your user info",
      ...formattedError,
    });
  }
  if (!user) {
    return res
      .status(401) // I dont know in what situation this would happen as the seal needs a userId on creation
      .json({ message: "Invalid userId, please login again" });
  }

  const userOrg = user.orgId !== DEFAULTS.NO_ORG ?? user.orgId;
  const [success, failed] = await Users.createLoginEventAndDeleteLoginLink({
    loginLinkId,
    user: user,
  });

  if (failed) {
    const formattedError = errorFormatter(failed);
    return res.status(formattedError.httpStatusCode).json({
      message: "Unable to create login event",
      ...formattedError,
    });
  }

  const cleanedUser = Sanitize.clean(user, ENTITY_TYPES.USER); // TODO not working!
  req.session.user = cleanedUser;
  /**
   * Get the user's org invites if they're not in an org.
   * The logic here being, if a user is in an org, what are the chances they're going to join another?
   *  TODO maybe revisit this?
   */
  let userInvites = []; // TODO types array of org invite
  if (req.session.user.orgId === DEFAULTS.NO_ORG) {
    const [invites, inviteError] = await Users.getInvitesForUser({
      userId: req.session.user.userId,
    });

    if (inviteError) {
      const formattedError = errorFormatter(inviteError);
      return res.status(formattedError.httpStatusCode).json({
        message: "An error ocurred getting your invites",
        ...formattedError,
      });
    }
    userInvites = invites;
  }
  req.session.user.totalInvites = userInvites.length;
  await req.session.save();

  // If a user has invites, redirect them to the invites page on login
  if (req.session.user.totalInvites > 0) {
    res.redirect(`${DOMAIN_NAME}/invites`);
    return;
  }

  res.redirect(307, callbackUrl);
  return;
};

export const logout = async (req: Request, res: Response) => {
  req.session.destroy();
  return res.status(200).json({ message: "You've been logged out" });
};
