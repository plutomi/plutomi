import { Request, Response } from "express";
import * as Questions from "../../models/Questions";
import * as Stages from "../../models/Stages";
import * as CreateError from "../../utils/createError";
const main = async (req: Request, res: Response) => {
  const { session } = res.locals;
  const { openingId, stageId, questionId } = req.params;
  const [stage, error] = await Stages.GetStageById({
    openingId,
    stageId,
    orgId: session.orgId,
  });

  let oldQuestionOrder = stage.questionOrder;

  if (error) {
    const { status, body } = CreateError.SDK(
      error,
      "An error ocurred deleting that question from this stage"
    );
    return res.status(status).json(body);
  }

  // TODO add a test for this
  if (!oldQuestionOrder.includes(questionId)) {
    return res.status(400).json({
      message: `The question ID '${questionId}' does not exist in this stage`,
    });
  }

  // Remove that question
  oldQuestionOrder.splice(oldQuestionOrder.indexOf(questionId), 1);

  const [updated, updateError] = await Questions.DeleteQuestionFromStage({
    openingId,
    stageId,
    questionId,
    orgId: session.orgId,
    questionOrder: oldQuestionOrder,
  });

  if (updateError) {
    const { status, body } = CreateError.SDK(
      updateError,
      "An error ocurred deleting that question"
    );
    return res.status(status).json(body);
  }

  return res.status(200).json({ message: "Question removed from stage!" });
};
export default main;
