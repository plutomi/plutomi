import { Request, Response } from "express";
import Joi from "joi";
import { DEFAULTS } from "../Config";
import * as Openings from "../models/Openings/index";
import * as Orgs from "../models/Orgs/index";
import * as Stages from "../models/Stages/index";
import errorFormatter from "../utils/errorFormatter";
export const getAllOpenings = async (req: Request, res: Response) => {
  const [openings, error] = await Orgs.getOpeningsInOrg({
    orgId: req.session.user.orgId,
  });

  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(formattedError.httpStatusCode).json({
      message: "An error ocurred retrieving the openings for this org",
      ...formattedError,
    });
  }

  return res.status(200).json(openings);
};

export const createOpeningController = async (req: Request, res: Response) => {
  const { GSI1SK } = req.body;

  if (req.session.user.orgId === DEFAULTS.NO_ORG) {
    return res.status(403).json({
      message: "Please create an organization before creating an opening",
    });
  }

  const createOpeningInput = {
    orgId: req.session.user.orgId,
    GSI1SK: GSI1SK,
  };

  const schema = Joi.object({
    orgId: Joi.string(),
    GSI1SK: Joi.string(),
  }).options({ presence: "required" });

  // Validate input
  try {
    await schema.validateAsync(createOpeningInput);
  } catch (error) {
    return res.status(400).json({ message: `${error.message}` });
  }

  const [created, createOpeningError] = await Openings.createOpening(
    createOpeningInput
  );

  if (createOpeningError) {
    const formattedError = errorFormatter(createOpeningError);
    return res.status(formattedError.httpStatusCode).json({
      message: "An error ocurred creating opening",
      ...formattedError,
    });
  }
  return res.status(201).json({ message: "Opening created!" });
};

export const getOpeningById = async (req: Request, res: Response) => {
  const { openingId } = req.params;

  const [opening, error] = await Openings.getOpeningById({
    openingId,
    orgId: req.session.user.orgId,
  });

  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(formattedError.httpStatusCode).json({
      message: "Unable to retrieve opening info",
      ...formattedError,
    });
  }
  if (!opening) {
    return res.status(404).json({ message: "Opening not found" });
  }

  return res.status(200).json(opening);
};

export const deleteOpeningController = async (req: Request, res: Response) => {
  const { openingId } = req.params;
  const { orgId } = req.session.user;
  const deleteOpeningInput = {
    orgId: req.session.user.orgId,
    openingId: openingId,
  };

  const [opening, openingError] = await Openings.getOpeningById({
    orgId,
    openingId,
  });

  if (openingError) {
    const formattedError = errorFormatter(openingError);
    return res.status(formattedError.httpStatusCode).json({
      message:
        "Unable to delete opening, error ocurred retrieving opening info",
      ...formattedError,
    });
  }
  // TODO we should send this to a queue instead, and delete all sub items
  const [allStages, allStagesError] = await Openings.getStagesInOpening({
    orgId,
    openingId,
    stageOrder: opening.stageOrder,
  });

  if (allStagesError) {
    const formattedError = errorFormatter(allStagesError);
    return res.status(formattedError.httpStatusCode).json({
      message: "Unable to delete opening, unable to get stage info",
      ...formattedError,
    });
  }
  // Delete stages first
  if (allStages.length) {
    allStages.map(async (stage) => {
      const input = {
        orgId: orgId,
        openingId: openingId,
        stageId: stage.stageId,
        stageOrder: opening.stageOrder,
      };
      await Stages.deleteStage(input);
    });
  }

  const [deleted, deleteOpeningError] = await Openings.deleteOpening(
    deleteOpeningInput
  );
  if (deleteOpeningError) {
    const formattedError = errorFormatter(deleteOpeningError);
    return res.status(formattedError.httpStatusCode).json({
      message: "Unable to delete opening",
      ...formattedError,
    });
  }
  return res.status(200).json({ message: "Opening deleted" });
};

export const updateOpeningController = async (req: Request, res: Response) => {
  const { openingId } = req.params;
  const { newOpeningValues } = req.body;

  const updateOpeningInput = {
    orgId: req.session.user.orgId,
    openingId: openingId,
    newOpeningValues: newOpeningValues,
  };

  const schema = Joi.object({
    orgId: Joi.string(),
    openingId: Joi.string(),
    newOpeningValues: Joi.object(), // TODO allow only specific values!!!
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
