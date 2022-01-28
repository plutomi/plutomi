import { Request, Response } from "express";
import Joi from "joi";
import { DEFAULTS, JOI_SETTINGS } from "../../Config";
import * as CreateError from "../../utils/createError";
import * as Openings from "../../models/Openings";
import * as Stages from "../../models/Stages";
const schema = Joi.object({
  body: {
    questionId: Joi.string(),
    /**
     * 0 based index on where should the question should be added
     * If no position is provided, question is added to the end of the stage
     */
    position: Joi.number()
      .min(0)
      .max(DEFAULTS.MAX_CHILD_ITEM_LIMIT - 1)
      .optional(),
  },
}).options(JOI_SETTINGS);

const main = async (req: Request, res: Response) => {
  const { session } = res.locals;
  try {
    await schema.validateAsync(req);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }

  let { questionId, position } = req.body;
  const { openingId, stageId } = req.params;

  const [stage, stageError] = await Stages.GetStageById({
    openingId,
    orgId: session.orgId,
    stageId,
  });

  if (stageError) {
    const { status, body } = CreateError.SDK(
      stageError,
      "Unable to retrieve stage info"
    );

    return res.status(status).json(body);
  }

  if (!stage) {
    return res.status(404).json({ message: "Stage does not exist" });
  }

  // TODO Update the stage with the new question order
  const [updatedStage, updatedStageError] = await Stages.UpdateStage({
      orgId: session.orgId,
      openingId, 
      stageId,
      position, // TODO 
      newValues: {

      }
  })
  // Create the stage and update the stage order, model will handle where to place it
  const [created, stageError] = await Stages.CreateStage({
    orgId: session.orgId,
    GSI1SK,
    openingId,
    position,
    stageOrder: opening.stageOrder,
  });

  if (stageError) {
    const { status, body } = CreateError.SDK(
      stageError,
      "An error ocurred creating your stage"
    );
    return res.status(status).json(body);
  }

  return res.status(201).json({ message: "Stage created!" });
};
export default main;
