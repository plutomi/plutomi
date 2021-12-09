import { Request, Response } from "express";
import { DEFAULTS, ENTITY_TYPES } from "./../Config";
import Sanitize from "./../utils/sanitize";
import Joi from "joi";
import * as Users from "../models/Users/Users";
import * as Orgs from "../models/Orgs/Orgs";
const UrlSafeString = require("url-safe-string"),
  tagGenerator = new UrlSafeString();

export const create = async (req: Request, res: Response) => {
  const { GSI1SK, orgId } = req.body;

  if (req.session.user.orgId !== DEFAULTS.NO_ORG) {
    return res.status(400).json({
      message: `You already belong to an org!`,
    });
  }

  const pendingInvites = await Users.getInvitesForUser({
    userId: req.session.user.userId,
  });

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

  try {
    await Orgs.createAndJoinOrg({
      userId: req.session.user.userId,
      orgId: orgId,
      GSI1SK: GSI1SK,
    });

    // Update the logged in user session with the new org id
    req.session.user.orgId = orgId;
    await req.session.save();

    return res.status(201).json({ message: "Org created!", org: orgId });
  } catch (error) {
    // TODO add error logger
    return res
      .status(400) // TODO change #
      .json({ message: `${error}` });
  }
};

/**
 * When signed in, this returns all data for an org
 * For public org data such as basic info or openings, please use the /public/:orgId route
 */
export const get = async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const [org, error] = await Orgs.getOrgById({ orgId: orgId });

  if (error) {
    console.log("Error retrieving org info", error);
    return res
      .status(500)
      .json({ message: "An error ocurred retrieving your org" });
  }

  if (!org) {
    return res.status(404).json({ message: "Org not found" });
  }

  if (orgId != req.session.user.orgId) {
    return res
      .status(403)
      .json({ message: "You are not authorized to view this org" });
  }

  return res.status(200).json(org);
};

export const deleteOrg = async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const [org, error] = await Orgs.getOrgById({ orgId: orgId });

  if (error) {
    console.log("Error retrieving org info", error);
    return res
      .status(500)
      .json({ message: "An error ocurred retrieving your org" });
  }

  if (!org) {
    return res.status(404).json({ message: "Org not found" });
  }
  if (org.totalUsers > 1) {
    return res.status(400).json({
      message: "You cannot delete this org as there are other users in it",
    });
  }

  try {
    const updatedUser = await Users.updateUser({
      // TODO possible transaction?
      userId: req.session.user.userId,
      newUserValues: {
        orgId: DEFAULTS.NO_ORG,
        orgJoinDate: DEFAULTS.NO_ORG,
        GSI1PK: DEFAULTS.NO_ORG,
      },
      ALLOW_FORBIDDEN_KEYS: true,
    });

    req.session.user = Sanitize.clean(updatedUser, ENTITY_TYPES.USER);
    await req.session.save();
    return res
      .status(200)
      .json({ message: `You've deleted the ${orgId} org :(` });
  } catch (error) {
    // TODO add error logger
    return res
      .status(500) // TODO change #
      .json({
        message: `Unable to delete org - ${error}`,
      });
  }
};

export const users = async (req: Request, res: Response) => {
  const { orgId } = req.params;
  if (req.session.user.orgId != orgId) {
    return res
      .status(403)
      .json({ message: "You cannot view the users of this org" });
  }

  if (req.session.user.orgId === DEFAULTS.NO_ORG) {
    return res.status(400).json({
      message: "You must create an org or join one to view it's users",
    });
  }

  try {
    const allUsers = await Orgs.getUsersInOrg({
      orgId: req.session.user.orgId,
    });
    return res.status(200).json(allUsers);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Unable to retrieve users - ${error}` });
  }
};
