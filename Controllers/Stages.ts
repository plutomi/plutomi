import { Request, Response } from "express";
import { DEFAULTS } from "../Config";
import { UpdateStageInput } from "../types/main";
import * as Stages from "../models/Stages/index";
import Joi from "joi";
import errorFormatter from "../utils/errorFormatter";
export const create = async (req: Request, res: Response) => {
  const { GSI1SK, openingId } = req.body;

  if (req.session.user.orgId === DEFAULTS.NO_ORG) {
    return res.status(403).json({
      message: "Please create an organization before creating a stage",
    });
  }
  const createStageInput = {
    orgId: req.session.user.orgId,
    openingId: openingId,
    GSI1SK: GSI1SK,
  };

  const schema = Joi.object({
    orgId: Joi.string(),
    openingId: Joi.string(),
    GSI1SK: Joi.string(),
  }).options({ presence: "required" }); // TODo add actual inputs of new question values

  // Validate input
  try {
    await schema.validateAsync(createStageInput);
  } catch (error) {
    return res.status(400).json({ message: `${error.message}` });
  }

  const [created, error] = await Stages.createStage(createStageInput);
  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(error.$metadata.httpStatusCode).json({
      message: "An error ocurred creating the stage",
      ...formattedError,
    });
  }
  return res.status(201).json({ message: "Stage created" });
};

export const deleteStage = async (req: Request, res: Response) => {
  const { stageId } = req.params;

  const deleteStageInput = {
    orgId: req.session.user.orgId,
    stageId: stageId,
  };

  const [deleted, error] = await Stages.deleteStage(deleteStageInput); // TODO fix this as its not grouped with the other funnels

  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(error.$metadata.httpStatusCode).json({
      message: "An error ocurred deleting stage",
      ...formattedError,
    });
  }
  return res.status(200).json({ message: "Stage deleted!" });
};

export const getStageInfo = async (req: Request, res: Response) => {
  const { stageId } = req.params;
  const getStageInput = {
    orgId: req.session.user.orgId,
    stageId: stageId,
  };

  const [stage, error] = await Stages.getStageById(getStageInput);

  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(error.$metadata.httpStatusCode).json({
      message: "An error ocurred retrieving stage info",
      ...formattedError,
    });
  }
  if (!stage) {
    return res.status(404).json({ message: "Stage not found" });
  }

  return res.status(200).json(stage);
};

export const update = async (req: Request, res: Response) => {
  const { newStageValues } = req.body;
  const { stageId } = req.params;

  const updateStageInput: UpdateStageInput = {
    orgId: req.session.user.orgId,
    stageId: stageId,
    newStageValues: newStageValues,
  };

  const schema = Joi.object({
    orgId: Joi.string(),
    stageId: Joi.string(),
    newStageValues: Joi.object(), // TODo add actual inputs of new stage values
  }).options({ presence: "required" });

  // Validate input
  try {
    await schema.validateAsync(updateStageInput);
  } catch (error) {
    return res.status(400).json({ message: `${error.message}` });
  }

  const [updated, error] = await Stages.updateStage(updateStageInput);
  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(error.$metadata.httpStatusCode).json({
      message: "An error ocurred updating stage",
      ...formattedError,
    });
  }
  return res.status(200).json({ message: "Stage updated!" });
};

export const getApplicantsInStage = async (req: Request, res: Response) => {
  const { stageId } = req.params;
  const getAllApplicantsInStageInput = {
    orgId: req.session.user.orgId,
    stageId: stageId,
  };

  const [applicants, error] = await Stages.getApplicantsInStage(
    getAllApplicantsInStageInput
  );

  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(error.$metadata.httpStatusCode).json({
      message: "An error ocurred getting applicants in this stage",
      ...formattedError,
    });
  }
  return res.status(200).json(applicants);
};

export const getQuestionsInStage = async (req: Request, res: Response) => {
  const { stageId } = req.params;

  const [questions, error] = await Stages.getQuestionsInStage({
    orgId: req.session.user.orgId,
    stageId,
  });

  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(error.$metadata.httpStatusCode).json({
      message: "An error ocurred retrieving questions in this stage",
      ...formattedError,
    });
  }
  return res.status(200).json(questions);
};
