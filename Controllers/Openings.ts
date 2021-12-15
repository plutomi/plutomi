import { Request, Response } from "express";
import Joi from "joi";
import { DEFAULTS } from "../Config";
import * as Openings from "../models/Openings/index";
import * as Orgs from "../models/Orgs/index";
import errorFormatter from "../utils/errorFormatter";
export const getAllOpenings = async (req: Request, res: Response) => {
  const [openings, error] = await Orgs.getOpeningsInOrg({
    orgId: req.session.user.orgId,
  });

  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(error.$metadata.httpStatusCode).json({
      message: "An error ocurred retrieving the openings for this org",
      ...formattedError,
    });
  }

  return res.status(200).json(openings);
};

export const createOpeningController = async (req: Request, res: Response) => {
  // TODO fix names
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

  const [created, error] = await Openings.createOpening(createOpeningInput);

  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(error.$metadata.httpStatusCode).json({
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
    return res.status(error.$metadata.httpStatusCode).json({
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
  // TODO fix name!!
  const { openingId } = req.params;

  const deleteOpeningInput = {
    orgId: req.session.user.orgId,
    openingId: openingId,
  };
  const [deleted, error] = await Openings.deleteOpening(deleteOpeningInput);
  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(error.$metadata.httpStatusCode).json({
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
    return res.status(error.$metadata.httpStatusCode).json({
      message: "Unable to update opening",
      ...formattedError,
    });
  }
  return res.status(200).json({ message: "Opening updated!" });
};

export const getApplicants = async (req: Request, res: Response) => {
  const { openingId } = req.params;
  const getAllApplicantsInOpeningInput = {
    orgId: req.session.user.orgId,
    openingId: openingId,
  };

  const schema = Joi.object({
    orgId: Joi.string(),
    openingId: Joi.string(),
  }).options({ presence: "required" });

  // Validate input
  try {
    await schema.validateAsync(getAllApplicantsInOpeningInput);
  } catch (error) {
    return res.status(400).json({ message: `${error.message}` });
  }

  const [applicants, error] = await Openings.getApplicantsInOpening(
    getAllApplicantsInOpeningInput
  );
  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(error.$metadata.httpStatusCode).json({
      message: "Unable to retrieve applicants",
      ...formattedError,
    });
  }
  return res.status(200).json(applicants);
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
    return res.status(openingInfoError.$metadata.httpStatusCode).json({
      message: "Unable to opening info",
      ...formattedError,
    });
  }
  const { stageOrder } = opening;

  const [allStages, error] = await Openings.getStagesInOpening({
    openingId: openingId,
    orgId: req.session.user.orgId,
    stageOrder: stageOrder,
  });
  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(error.$metadata.httpStatusCode).json({
      message: "Unable to retrieve stages",
      ...formattedError,
    });
  }
  return res.status(200).json(allStages);
};
