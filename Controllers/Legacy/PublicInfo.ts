import { ENTITY_TYPES } from "./../../Config";
import { Request, Response } from "express";
import Sanitize from "./../../utils/sanitize";
import * as Stages from "../../models/Stages/index";
import errorFormatter from "../../utils/errorFormatter";

export const getStageInfo = async (req: Request, res: Response) => {
  const { orgId, stageId } = req.params;

  // TODO this needs, opening id. is legacy
  const [stage, error] = await Stages.GetStageById({ orgId, stageId });
  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(formattedError.httpStatusCode).json({
      message: "An error ocurred retrieving this stage's info",
      ...formattedError,
    });
  }
  if (!stage) {
    return res.status(404).json({ message: "Stage not found" });
  }

  const cleanedStage = Sanitize.clean(stage, ENTITY_TYPES.STAGE);
  return res.status(200).json(cleanedStage);
};

export const getStageQuestions = async (req: Request, res: Response) => {
  const { orgId, stageId } = req.params;

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
    orgId,
    stageId,
    questionOrder: questionOrder,
  });

  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(formattedError.httpStatusCode).json({
      message: "An error ocurred retrieving questions for this stage",
      ...formattedError,
    });
  }
  return res.status(200).json(questions);
};
