import { Request, Response } from "express";
import Joi from "joi";
import { DEFAULTS } from "../Config";
import { createStage } from "../utils/stages/createStage";

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

  try {
    await createStage(createStageInput);
    return res.status(201).json({ message: "Stage created" });
  } catch (error) {
    // TODO add error logger
    return res
      .status(400) // TODO change #
      .json({ message: `Unable to create stage: ${error}` });
  }
};
