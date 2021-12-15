import { Request, Response } from "express";
import { DEFAULTS, ENTITY_TYPES } from "./../Config";
import Sanitize from "./../utils/sanitize";
import Joi from "joi";
import * as Users from "../models/Users/index";
import * as Orgs from "../models/Orgs/index";
import errorFormatter from "../utils/errorFormatter";
const UrlSafeString = require("url-safe-string"),
  tagGenerator = new UrlSafeString();

export const create = async (req: Request, res: Response) => {
  const { GSI1SK, orgId } = req.body;

  if (req.session.user.orgId !== DEFAULTS.NO_ORG) {
    return res.status(400).json({
      message: `You already belong to an org!`,
    });
  }

  const [pendingInvites, error] = await Users.getInvitesForUser({
    userId: req.session.user.userId,
  });

  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(formattedError.httpStatusCode).json({
      message: "Unable to create org - error retrieving invites",
      ...formattedError,
    });
  }

  if (pendingInvites && pendingInvites.length) {
    return res.status(403).json({
      message:
        "You seem to have pending invites, please accept or reject them before creating an org :)", // TODO error enum
    });
  }

  const createOrgInput = {
    GSI1SK: GSI1SK,
    orgId: orgId,
    user: req.session.user,
  };

  const schema = Joi.object({
    orgId: Joi.string().invalid(
      DEFAULTS.NO_ORG,
      tagGenerator.generate(DEFAULTS.NO_ORG)
    ),
    GSI1SK: Joi.string().invalid(
      DEFAULTS.NO_ORG,
      tagGenerator.generate(DEFAULTS.NO_ORG)
    ),
    user: Joi.object(),
  }).options({ presence: "required" });

  // Validate input
  try {
    await schema.validateAsync(createOrgInput);
  } catch (error) {
    return res.status(400).json({ message: `${error.message}` });
  }

  const [created, failed] = await Orgs.createAndJoinOrg({
    userId: req.session.user.userId,
    orgId: orgId,
    GSI1SK: GSI1SK,
  });

  if (failed) {
    const formattedError = errorFormatter(failed);
    return res.status(formattedError.httpStatusCode).json({
      message: "Unable to create org",
      ...formattedError,
    });
  }
  // Update the logged in user session with the new org id
  req.session.user.orgId = orgId;
  await req.session.save();

  return res.status(201).json({ message: "Org created!", org: orgId });
};

/**
 * When signed in, this returns all data for an org
 * For public org data such as basic info or openings, please use the /public/:orgId route
 */
export const get = async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const [org, error] = await Orgs.getOrgById({ orgId: orgId });

  if (orgId !== req.session.user.orgId) {
    return res
      .status(403)
      .json({ message: "You are not authorized to view this org" });
  }

  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(formattedError.httpStatusCode).json({
      message: "Unable to retrieve org info",
      ...formattedError,
    });
  }

  if (!org) {
    return res.status(404).json({ message: "Org not found" });
  }

  return res.status(200).json(org);
};

export const deleteOrg = async (req: Request, res: Response) => {
  const { orgId } = req.session.user;
  const [org, error] = await Orgs.getOrgById({ orgId: orgId });

  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(formattedError.httpStatusCode).json({
      message: "Unable to retrieve org info",
      ...formattedError,
    });
  }

  if (!org) {
    return res.status(404).json({ message: "Org not found" });
  }
  if (org.totalUsers > 1) {
    return res.status(400).json({
      message: "You cannot delete this org as there are other users in it",
    });
  }

  const [updatedUser, userUpdateError] = await Users.updateUser({
    // TODO possible transaction?
    userId: req.session.user.userId,
    newUserValues: {
      orgId: DEFAULTS.NO_ORG,
      orgJoinDate: DEFAULTS.NO_ORG,
      GSI1PK: DEFAULTS.NO_ORG,
    },
    ALLOW_FORBIDDEN_KEYS: true,
  });

  if (userUpdateError) {
    const formattedError = errorFormatter(userUpdateError);
    return res.status(formattedError.httpStatusCode).json({
      message:
        "We were unable to remove you from the org :( TODO - stuck condition if the org is already deleted, should be done in a transaction",
      ...formattedError,
    });
  }
  req.session.user = Sanitize.clean(updatedUser, ENTITY_TYPES.USER);
  await req.session.save();
  return res
    .status(200)
    .json({ message: `You've deleted the ${orgId} org :(` });
};

export const users = async (req: Request, res: Response) => {
  const { orgId } = req.params;

  if (req.session.user.orgId === DEFAULTS.NO_ORG) {
    return res.status(400).json({
      message: "You must create an org or join one to view it's users",
    });
  }

  if (req.session.user.orgId !== orgId) {
    return res
      .status(403)
      .json({ message: "You cannot view the users of this org" });
  }

  const [users, error] = await Orgs.getUsersInOrg({
    orgId: req.session.user.orgId,
  });

  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(formattedError.httpStatusCode).json({
      message: "An error ocurred getting the users in your org",
      ...formattedError,
    });
  }

  return res.status(200).json(users);
};
