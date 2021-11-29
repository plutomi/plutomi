import { ENTITY_TYPES } from "../Config";
import { getOrg } from "../utils/orgs/getOrg";
import { Request, Response } from "express";
import Sanitize from "../utils/sanitize";

export const getOrgInfo = async (req: Request, res: Response) => {
  const { orgId } = req.params;
  !orgId && res.status(400).json({ message: "orgId is missing" });

  const [org, error] = await getOrg({ orgId: orgId });

  error &&
    res.status(400).json({
      message: `An error ocurred retrieving your org: ${error.message}`,
    });

  !org && res.status(404).json({ message: "Org not found" });

  const cleanedOrg = Sanitize.clean(org, ENTITY_TYPES.ORG);
  return res.status(200).json(cleanedOrg);
};
