import { Request, Response } from "express";
import Joi from "joi";
import { JOI_GLOBAL_FORBIDDEN, JOI_SETTINGS } from "../../Config";
import * as Stages from "../../models/Stages";
import * as CreateError from "../../utils/errorGenerator";

const JOI_FORBIDDEN_STAGE = Joi.object({
  ...JOI_GLOBAL_FORBIDDEN,
  openingId: Joi.any().forbidden().strip(),
  stageId: Joi.any().forbidden().strip(),
  GSI1PK: Joi.any().forbidden().strip(),
  totalApplicants: Joi.any().forbidden().strip(),
});

const schema = Joi.object({
  body: {
    newValues: JOI_FORBIDDEN_STAGE,
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
  const { openingId, stageId } = req.params;
  const { newValues } = req.body;

  const [updatedStage, error] = await Stages.UpdateStage({
    orgId: session.orgId,
    openingId,
    stageId,
    newValues,
  });

  if (error) {
    const { status, body } = CreateError.SDK(
      error,
      "An error ocurred updating this stage"
    );
    return res.status(status).json(body);
  }

  return res.status(200).json({
    message: "Stage updated!",
  });
};
export default main;
