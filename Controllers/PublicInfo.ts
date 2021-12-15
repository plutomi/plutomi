import { ENTITY_TYPES } from "./../Config";
import { Request, Response } from "express";
import Sanitize from "./../utils/sanitize";
import * as Openings from "../models/Openings/index";
import * as Orgs from "../models/Orgs/index";
import * as Stages from "../models/Stages/index";
import errorFormatter from "../utils/errorFormatter";
export const getOrgInfo = async (req: Request, res: Response) => {
  const { orgId } = req.params;

  if (!orgId) {
    return res.status(400).json({ message: "orgId is missing" });
  }

  const [org, error] = await Orgs.getOrgById({ orgId });

  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(formattedError.httpStatusCode).json({
      message: "An error ocurred retrieving this org's info",
      ...formattedError,
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
  const [openings, error] = await Orgs.getOpeningsInOrg({ orgId });
  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(formattedError.httpStatusCode).json({
      message: "An error ocurred retrieving the openings for this org",
      ...formattedError,
    });
  }
  const publicOpenings = openings.filter((opening) => opening.isPublic);

  publicOpenings.forEach((opening) =>
    Sanitize.clean(opening, ENTITY_TYPES.OPENING)
  );

  return res.status(200).json(publicOpenings);
};

export const getOpeningInfo = async (req: Request, res: Response) => {
  const { orgId, openingId } = req.params;

  const [opening, error] = await Openings.getOpeningById({
    orgId,
    openingId,
  });

  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(formattedError.httpStatusCode).json({
      message: "An error ocurred retrieving this opening's",
      ...formattedError,
    });
  }
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

export const getStageInfo = async (req: Request, res: Response) => {
  const { orgId, stageId } = req.params;

  const [stage, error] = await Stages.getStageById({ orgId, stageId });
  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(formattedError.httpStatusCode).json({
      message: "An error ocurred retrieving this stage's info",
      ...formattedError,
    });
  }
  if (!stage) {
    return res.status(404).json({ message: "Stage not found" });
  }

  const cleanedStage = Sanitize.clean(stage, ENTITY_TYPES.STAGE);
  return res.status(200).json(cleanedStage);
};

export const getStageQuestions = async (req: Request, res: Response) => {
  const { orgId, stageId } = req.params;

  const [questions, error] = await Stages.getQuestionsInStage({
    orgId,
    stageId,
  });

  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(formattedError.httpStatusCode).json({
      message: "An error ocurred retrieving questions for this stage",
      ...formattedError,
    });
  }
  return res.status(200).json(questions);
};
