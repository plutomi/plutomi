import { Request, Response } from "express";
import Joi from "joi";
import * as Openings from "../models/Openings/index";
import errorFormatter from "../utils/errorFormatter";

export const updateOpeningController = async (req: Request, res: Response) => {
  const { openingId } = req.params;
  const { newValues } = req.body;

  const updateOpeningInput = {
    orgId: req.session.user.orgId,
    openingId: openingId,
    newValues,
  };

  const schema = Joi.object({
    orgId: Joi.string(),
    openingId: Joi.string(),
    newValues: Joi.object(), // TODO allow only specific values!!!
  }).options({ presence: "required" });

  // Validate input
  try {
    await schema.validateAsync(updateOpeningInput);
  } catch (error) {
    return res.status(400).json({ message: `${error.message}` });
  }

  const [updated, error] = await Openings.updateOpening(updateOpeningInput);
  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(formattedError.httpStatusCode).json({
      message: "Unable to update opening",
      ...formattedError,
    });
  }
  return res.status(200).json({ message: "Opening updated!" });
};

export const getStages = async (req: Request, res: Response) => {
  const { openingId } = req.params;
  const { orgId } = req.session.user;

  const [opening, openingInfoError] = await Openings.getOpeningById({
    orgId,
    openingId,
  });

  if (openingInfoError) {
    const formattedError = errorFormatter(openingInfoError);
    return res.status(formattedError.httpStatusCode).json({
      message: "Unable to opening info",
      ...formattedError,
    });
  }
  const { stageOrder } = opening;

  const [allStages, stagesError] = await Openings.getStagesInOpening({
    openingId: openingId,
    orgId: req.session.user.orgId,
    stageOrder: stageOrder,
  });
  if (stagesError) {
    const formattedError = errorFormatter(stagesError);
    return res.status(formattedError.httpStatusCode).json({
      message: "Unable to retrieve stages",
      ...formattedError,
    });
  }
  return res.status(200).json(allStages);
};
