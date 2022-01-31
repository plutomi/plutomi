import { Request, Response } from "express";
import Joi from "joi";
import { JOI_GLOBAL_FORBIDDEN, JOI_SETTINGS } from "../../Config";
import * as Stages from "../../models/Stages";
import { DynamoNewStage } from "../../types/dynamo";
import * as CreateError from "../../utils/createError";

export interface APIUpdateStageOptions
  extends Partial<Pick<DynamoNewStage, "GSI1SK">> {
  [key: string]: any;
}

const JOI_FORBIDDEN_STAGE = Joi.object({
  ...JOI_GLOBAL_FORBIDDEN,
  openingId: Joi.any().forbidden(),
  stageId: Joi.any().forbidden(),
  GSI1PK: Joi.any().forbidden(),
  questionOrder: Joi.any().forbidden(),
  totalApplicants: Joi.any().forbidden(),
});

const schema = Joi.object({
  body: JOI_FORBIDDEN_STAGE,
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

  const [updatedStage, error] = await Stages.UpdateStage({
    orgId: session.orgId,
    openingId,
    stageId,
    newValues: req.body,
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
