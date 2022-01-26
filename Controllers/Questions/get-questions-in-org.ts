import { Request, Response } from "express";
import * as Questions from "../../models/Questions";
import * as CreateError from "../../utils/createError";
const main = async (req: Request, res: Response) => {
  const { session } = res.locals;

  const [questions, questionsError] = await Questions.GetQuestionsInOrg({
    orgId: session.orgId,
  });

  if (questionsError) {
    const { status, body } = CreateError.SDK(
      questionsError,
      "An error ocurred retrieving your questions"
    );
    return res.status(status).json(body);
  }
  return res.status(200).json(questions);
};
export default main;
