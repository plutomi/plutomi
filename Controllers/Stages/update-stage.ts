import { Request, Response } from "express";
import Joi from "joi";
import { DEFAULTS, JOI_GLOBAL_FORBIDDEN, JOI_SETTINGS } from "../../Config";
import * as Stages from "../../models/Stages";
import { DynamoNewStage } from "../../types/dynamo";
import * as CreateError from "../../utils/createError";

export interface APIUpdateStageOptions
  extends Partial<Pick<DynamoNewStage, "GSI1SK" | "questionOrder">> {
  [key: string]: any;
}

const JOI_FORBIDDEN_STAGE = Joi.object({
  ...JOI_GLOBAL_FORBIDDEN,
  openingId: Joi.any().forbidden(),
  stageId: Joi.any().forbidden(),
  GSI1PK: Joi.any().forbidden(),
  questionOrder: Joi.array().items(Joi.string()).optional(),
  totalApplicants: Joi.any().forbidden(),
  GSI1SK: Joi.string().optional().max(DEFAULTS.MAX_STAGE_NAME_LENGTH),
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

  // // TODO !!!
  // if (req.body.questionOrder) {
  //   if (req.body.stageOrder.length != opening.stageOrder.length) {
  //     return res.status(403).json({
  //       message:
  //         "You cannot add / delete stages this way, please use the proper API methods for those actions",
  //     });
  //   }

  //   // Check if the IDs have been modified
  //   // TODO add a test for this
  //   const containsAll = opening.stageOrder.every((stageId) => {
  //     return req.body.stageOrder.includes(stageId);
  //   });

  //   if (!containsAll) {
  //     return res.status(400).json({
  //       message:
  //         "It appears that the stageIds have been modified, please check your request and try again",
  //     });
  //   }
  // }

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
