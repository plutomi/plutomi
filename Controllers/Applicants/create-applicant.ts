import { Request, Response } from "express";
import Joi from "joi";
import * as Openings from "../../models/Openings";
import * as Applicants from "../../models/Applicants";
import {
  DEFAULTS,
  JoiOrgId,
  JOI_GLOBAL_FORBIDDEN,
  JOI_SETTINGS,
} from "../../Config";
import * as CreateError from "../../utils/errorGenerator";
const schema = Joi.object({
  body: {
    ...JOI_GLOBAL_FORBIDDEN,
    orgId: JoiOrgId, 
    openingId: Joi.string(),
    email: Joi.string().email(),
    firstName: Joi.string().invalid(DEFAULTS.FIRST_NAME).max(20),
    lastName: Joi.string().invalid(DEFAULTS.LAST_NAME).max(20),
  },
}).options(JOI_SETTINGS);
import emailValidator from "deep-email-validator";

const main = async (req: Request, res: Response) => {
  // TODO implement only one application per email
  // https://github.com/plutomi/plutomi/issues/521
  try {
    await schema.validateAsync(req);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }

  const emailValidation = await emailValidator({
    email: req.body.email,
    validateSMTP: false, // TODO BUG, this isnt working
  });

  if (!emailValidation.valid) {
    return res.status(400).json({
      message: "Hmm... that email doesn't seem quite right. Check it again.",
    });
  }
  const { openingId, orgId, firstName, lastName, email } = req.body;

  const [opening, openingError] = await Openings.getOpeningById({
    openingId,
    orgId,
  });

  if (openingError) {
    const { status, body } = CreateError.SDK(
      openingError,
      "An error ocurred getting your opening info"
    );
    return res.status(status).json(body);
  }

  if (!opening) {
    return res.status(404).json({ message: "Opening does not exist" });
  }
  // Conditional check will also catch this
  if (opening.GSI1SK === "PRIVATE" || opening.totalStages === 0) {
    return res
      .status(403)
      .json({ message: "You cannot apply to this opening just yet!" });
  }

  const [created, failed] = await Applicants.createApplicant({
    firstName,
    lastName,
    openingId,
    orgId,
    email,
    stageId: opening.stageOrder[0],
  });

  if (failed) {
    const { status, body } = CreateError.SDK(
      failed,
      "An error ocurred creating your application"
    );

    return res.status(status).json(body);
  }

  return res
    .status(200)
    .json({ message: "We've created your application! Check your email." });
};
export default main;
