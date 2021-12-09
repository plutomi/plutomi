import { ENTITY_TYPES } from "../../Config";
import { getOrg } from "../../utils/orgs/getOrg";
import { Request, Response } from "express";
import Sanitize from "../../utils/sanitize";
import { getAllOpeningsInOrg } from "../../utils/openings/getAllOpeningsInOrg";
import { getOpening } from "../../utils/openings/getOpeningById";
import { getStageById } from "../../utils/stages/getStageById";
import { getAllQuestionsInStage } from "../../utils/questions/getAllQuestionsInStage";

export const getOrgInfo = async (req: Request, res: Response) => {
  const { orgId } = req.params;

  if (!orgId) {
    return res.status(400).json({ message: "orgId is missing" });
  }

  const [org, error] = await getOrg({ orgId: orgId });

  if (error instanceof Error) {
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

export const getOpeningInfo = async (req: Request, res: Response) => {
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

export const getStageInfo = async (req: Request, res: Response) => {
  const { orgId, stageId } = req.params;
  try {
    const stage = await getStageById({ orgId, stageId });
    if (!stage) {
      return res.status(404).json({ message: "Stage not found" });
    }

    //   if (!stage.isPublic) { // TODO add public and private stages?
    //     return res
    //       .status(400)
    //       .json({ message: "You cannot apply here just yet" });
    //   }
    const cleanedStage = Sanitize.clean(stage, ENTITY_TYPES.STAGE);
    return res.status(200).json(cleanedStage);
  } catch (error) {
    // TODO add error logger
    return res
      .status(400) // TODO change #
      .json({ message: `Unable to get stage: ${error}` });
  }
};

export const getStageQuestions = async (req: Request, res: Response) => {
  const { orgId, stageId } = req.params;
  try {
    const questions = await getAllQuestionsInStage({
      orgId,
      stageId,
    });

    // TODO add filter here for public / private questions
    return res.status(200).json(questions);
  } catch (error) {
    return res.status(500).json({ message: "Unable to retrieve questions" });
  }
};
