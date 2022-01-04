import { Request, Response } from "express";
import { DEFAULTS, ENTITY_TYPES } from "./../Config";
import Sanitize from "./../utils/sanitize";
import * as Users from "../models/Users/index";
import * as Orgs from "../models/Orgs/index";
import errorFormatter from "../utils/errorFormatter";
const UrlSafeString = require("url-safe-string"),
  tagGenerator = new UrlSafeString();
/**
 * When signed in, this returns all data for an org
 * For public org data such as basic info or openings, please use the /public/:orgId route
 */

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
