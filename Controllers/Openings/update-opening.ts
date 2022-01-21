import { Request, Response } from "express";
import Joi from "joi";
import * as Openings from "../../models/Openings";
import * as CreateError from "../../utils/errorGenerator";
import { DEFAULTS, JOI_GLOBAL_FORBIDDEN, JOI_SETTINGS } from "../../Config";
import { UpdateOpeningInput } from "../../types/main";

const JOI_FORBIDDEN_OPENING = Joi.object({
  ...JOI_GLOBAL_FORBIDDEN,
  openingId: Joi.any().forbidden().strip(),
  GSI1PK: Joi.any().forbidden().strip(),
  totalStages: Joi.any().forbidden().strip(),
  totalApplicants: Joi.any().forbidden().strip(),
});

const schema = Joi.object({
  body: {
    newValues: JOI_FORBIDDEN_OPENING,
  },
}).options(JOI_SETTINGS);

const main = async (req: Request, res: Response) => {
  try {
    await schema.validateAsync(req);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }

  const { session } = res.locals;
  const { openingId } = req.params;
  const { newValues } = req.body;

  const updateOpeningInput: UpdateOpeningInput = {
    openingId,
    orgId: session.orgId,
    newValues,
  };

  const [updatedOpening, error] = await Openings.updateOpening(
    updateOpeningInput
  );

  if (error) {
    const { status, body } = CreateError.SDK(
      error,
      "An error ocurred updating this opening"
    );

    return res.status(status).json(body);
  }

  return res.status(200).json({
    message: "Opening updated!",
  });
};

export default main;
