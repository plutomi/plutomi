import { Request, Response } from "express";
import Joi from "joi";
import { DEFAULTS } from "../Config";
import { createOpening } from "../utils/openings/createOpening";
import { getAllOpeningsInOrg } from "../utils/openings/getAllOpeningsInOrg";

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

    await createOpening(createOpeningInput);
    return res.status(201).json({ message: "Opening created!" });
  } catch (error) {
    // TODO add error logger
    return res
      .status(400) // TODO change #
      .json({ message: `Unable to create opening: ${error}` });
  }
};
