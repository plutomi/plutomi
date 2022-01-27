import { Request, Response } from "express";
import * as Questions from "../../models/Questions";
import * as CreateError from "../../utils/createError";
const main = async (req: Request, res: Response) => {
  const { session } = res.locals;

  // TODO this needs major revamp when attached to stages
  const [success, failure] = await Questions.DeleteQuestion({
    orgId: session.orgId,
    questionId: req.params.questionId,
  });

  if (failure) {
    const { status, body } = CreateError.SDK(
      failure,
      "An error ocurred deleting that question"
    );
    return res.status(status).json(body);
  }

  return res.status(200).json({ message: "Question deleted!" });
};
export default main;
