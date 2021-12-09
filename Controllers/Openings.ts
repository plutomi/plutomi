import { Request, Response } from "express";
import Joi from "joi";
import { DEFAULTS } from "../Config";
import { getAllApplicantsInOpening } from "../utils/openings/getAllApplicantsInOpening";
import { getAllOpeningsInOrg } from "../utils/openings/getAllOpeningsInOrg";
import { getAllStagesInOpening } from "../utils/openings/getAllStagesInOpening";
import * as Openings from "../models/Openings";
import updateOpening from "../utils/openings/updateOpening";

export const getAllOpenings = async (req: Request, res: Response) => {
  try {
    const allOpenings = await getAllOpeningsInOrg({
      orgId: req.session.user.orgId,
    });
    return res.status(200).json(allOpenings);
  } catch (error) {
    // TODO add error logger
    return res
      .status(400) // TODO change #
      .json({ message: `Unable to retrieve openings: ${error}` });
  }
};

export const createOpeningController = async (req: Request, res: Response) => {
  // TODO fix names
  const { GSI1SK } = req.body;

  if (req.session.user.orgId === DEFAULTS.NO_ORG) {
    return res.status(403).json({
      message: "Please create an organization before creating an opening",
    });
  }

  try {
    const createOpeningInput = {
      orgId: req.session.user.orgId,
      GSI1SK: GSI1SK,
    };

    const schema = Joi.object({
      GSI1SK: Joi.string(),
    }).options({ presence: "required" });

    // Validate input
    try {
      await schema.validateAsync(createOpeningInput);
    } catch (error) {
      return res.status(400).json({ message: `${error.message}` });
    }

    await Openings.createOpening(createOpeningInput);
    return res.status(201).json({ message: "Opening created!" });
  } catch (error) {
    // TODO add error logger
    return res
      .status(400) // TODO change #
      .json({ message: `Unable to create opening: ${error}` });
  }
};

export const getOpeningById = async (req: Request, res: Response) => {
  const { openingId } = req.params;
  try {
    const opening = await Openings.getOpeningById({
      openingId,
      orgId: req.session.user.orgId,
    });
    if (!opening) {
      return res.status(404).json({ message: "Opening not found" });
    }

    return res.status(200).json(opening);
  } catch (error) {
    // TODO add error logger
    return res
      .status(400) // TODO change #
      .json({ message: `Unable to get opening: ${error}` });
  }
};

export const deleteOpeningController = async (req: Request, res: Response) => {
  // TODO fix name!!
  const { openingId } = req.params;
  try {
    const deleteOpeningInput = {
      orgId: req.session.user.orgId,
      openingId: openingId,
    };
    await Openings.deleteOpening(deleteOpeningInput);
    return res.status(200).json({ message: "Opening deleted" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Unable to delete your opening ${error}` });
  }
};

export const updateOpeningController = async (req: Request, res: Response) => {
  const { openingId } = req.params;
  const { newOpeningValues } = req.body;
  try {
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

    await updateOpening(updateOpeningInput);
    return res.status(200).json({ message: "Opening updated!" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Unable to update opening - ${error}` });
  }
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

  try {
    const allApplicants = await getAllApplicantsInOpening(
      getAllApplicantsInOpeningInput
    );
    return res.status(200).json(allApplicants);
  } catch (error) {
    // TODO add error logger
    return res
      .status(400) // TODO change #
      .json({ message: `Unable to retrieve applicants: ${error}` });
  }
};

export const getStages = async (req: Request, res: Response) => {
  const { openingId } = req.params;
  try {
    const allStages = await getAllStagesInOpening({
      openingId: openingId,
      orgId: req.session.user.orgId,
    });
    return res.status(200).json(allStages);
  } catch (error) {
    // TODO add error logger
    return res
      .status(400) // TODO change #
      .json({ message: `Unable to retrieve stages: ${error}` });
  }
};
