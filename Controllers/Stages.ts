import { Request, Response } from "express";
import { DEFAULTS } from "../Config";
import {
  CreateStageInput,
  DeleteStageInput,
  UpdateStageInput,
} from "../types/main";
import * as Stages from "../models/Stages/index";
import * as Openings from "../models/Openings/index";
import Joi from "joi";
import errorFormatter from "../utils/errorFormatter";
export const create = async (req: Request, res: Response) => {
  const { GSI1SK, openingId } = req.body;
  const { orgId } = req.session.user;
  if (req.session.user.orgId === DEFAULTS.NO_ORG) {
    return res.status(403).json({
      message: "Please create an organization before creating a stage",
    });
  }
  let createStageInput: CreateStageInput = {
    orgId: req.session.user.orgId,
    openingId: openingId,
    GSI1SK: GSI1SK,
    stageOrder: [], // TODO THIS IS BAD AND SHOULD NOT BE HERE!!!!!!!!!
  };

  const schema = Joi.object({
    orgId: Joi.string(),
    openingId: Joi.string(),
    GSI1SK: Joi.string(),
    stageOrder: Joi.array(), // TODO THIS IS BAD AND SHOULD NOT BE HERE!!!!!!!!!
  }).options({ presence: "required" });

  // Validate input
  try {
    await schema.validateAsync(createStageInput);
  } catch (error) {
    return res.status(400).json({ message: `${error.message}` });
  }

  let [opening, openingError] = await Openings.getOpeningById({
    orgId,
    openingId,
  });

  if (openingError) {
    const formattedError = errorFormatter(openingError);
    return res.status(formattedError.httpStatusCode).json({
      message:
        "An error ocurred creating the stage, unable to get opening info",
      ...formattedError,
    });
  }
  createStageInput = { ...createStageInput, stageOrder: opening.stageOrder };

  const [created, error] = await Stages.createStage(createStageInput);
  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(formattedError.httpStatusCode).json({
      message: "An error ocurred creating the stage",
      ...formattedError,
    });
  }
  return res.status(201).json({ message: "Stage created" });
};

export const deleteStage = async (req: Request, res: Response) => {
  const { stageId } = req.params;
  const { orgId } = req.session.user;

  let [stage, stageError] = await Stages.getStageById({ orgId, stageId });

  if (stageError) {
    const formattedError = errorFormatter(stageError);
    return res.status(formattedError.httpStatusCode).json({
      message: "An error ocurred deleting stage, unable to get stage info",
      ...formattedError,
    });
  }

  let [opening, openingError] = await Openings.getOpeningById({
    orgId: orgId,
    openingId: stage.openingId,
  });

  if (openingError) {
    const formattedError = errorFormatter(openingError);
    return res.status(formattedError.httpStatusCode).json({
      message: "An error ocurred deleting stage, unable to get opening info",
      ...formattedError,
    });
  }

  const deleteStageInput: DeleteStageInput = {
    orgId: req.session.user.orgId,
    stageId: stageId,
    openingId: opening.openingId,
    stageOrder: opening.stageOrder,
  };

  const [deleted, error] = await Stages.deleteStage(deleteStageInput); // TODO fix this as its not grouped with the other funnels

  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(formattedError.httpStatusCode).json({
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
    return res.status(formattedError.httpStatusCode).json({
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
    return res.status(formattedError.httpStatusCode).json({
      message: "An error ocurred updating stage",
      ...formattedError,
    });
  }
  return res.status(200).json({ message: "Stage updated!" });
};

export const getApplicantsInStage = async (req: Request, res: Response) => {
  const { openingId, stageId } = req.params;
  const getAllApplicantsInStageInput = {
    orgId: req.session.user.orgId,
    stageId,
    openingId,
  };

  console.log("Input for applicants in stage", getAllApplicantsInStageInput);
  const [applicants, error] = await Stages.getApplicantsInStage(
    getAllApplicantsInStageInput
  );

  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(formattedError.httpStatusCode).json({
      message: "An error ocurred getting applicants in this stage",
      ...formattedError,
    });
  }
  return res.status(200).json(applicants);
};

export const getQuestionsInStage = async (req: Request, res: Response) => {
  const { stageId } = req.params;
  const { orgId } = req.session.user;
  const [stage, stageInfoError] = await Stages.getStageById({ orgId, stageId });
  if (stageInfoError) {
    const formattedError = errorFormatter(stageInfoError);
    return res.status(formattedError.httpStatusCode).json({
      message:
        "An error ocurred retrieving questions in this stage, unable to get stage info",
      ...formattedError,
    });
  }
  const { questionOrder } = stage;

  const [questions, error] = await Stages.getQuestionsInStage({
    orgId: req.session.user.orgId,
    stageId,
    questionOrder: questionOrder,
  });

  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(formattedError.httpStatusCode).json({
      message: "An error ocurred retrieving questions in this stage",
      ...formattedError,
    });
  }
  return res.status(200).json(questions);
};
