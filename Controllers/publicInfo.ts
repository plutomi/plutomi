import { ENTITY_TYPES } from "../Config";
import { getOrg } from "../utils/orgs/getOrg";
import { Request, Response } from "express";
import Sanitize from "../utils/sanitize";
import { getAllOpeningsInOrg } from "../utils/openings/getAllOpeningsInOrg";
import { getOpening } from "../utils/openings/getOpeningById";

export const getOrgInfo = async (req: Request, res: Response) => {
  const { orgId } = req.params;

  if (!orgId) {
    return res.status(400).json({ message: "orgId is missing" });
  }

  const [org, error] = await getOrg({ orgId: orgId });

  if (error) {
    return res.status(400).json({
      message: `An error ocurred retrieving your org: ${error.message}`,
    });
  }

  if (!org) {
    return res.status(404).json({ message: "Org not found" });
  }

  const cleanedOrg = Sanitize.clean(org, ENTITY_TYPES.ORG);
  return res.status(200).json(cleanedOrg);
};

export const getOrgOpenings = async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const allOpenings = await getAllOpeningsInOrg({ orgId });
  const publicOpenings = allOpenings.filter((opening) => opening.isPublic);

  publicOpenings.forEach((opening) =>
    Sanitize.clean(opening, ENTITY_TYPES.OPENING)
  );

  return res.status(200).json(publicOpenings);
};

export const getSingleOrgOpening = async (req: Request, res: Response) => {
  const { orgId, openingId } = req.params;

  const opening = await getOpening({ orgId: orgId, openingId: openingId });
  if (!opening) {
    return res.status(404).json({ message: "Opening not found" });
  }

  if (!opening.isPublic) {
    return res.status(403).json({
      message: "You cannot apply here just yet! Sorry for the inconvenience.",
    });
  }

  const cleanedOpening = Sanitize.clean(opening, ENTITY_TYPES.OPENING);
  return res.status(200).json(cleanedOpening);
};
