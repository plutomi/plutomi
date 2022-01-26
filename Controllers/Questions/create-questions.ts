import { Request, Response } from "express";
import * as Stages from "../../models/Stages";
import * as CreateError from "../../utils/createError";
import * as Questions from "../../models/Questions";
import { DynamoNewQuestion } from "../../types/dynamo";
import Joi from "joi";
import { JOI_SETTINGS } from "../../Config";

export type APICreateQuestionOptions = Pick<
  DynamoNewQuestion,
  "questionId" | "GSI1SK" | "description"
>;
const schema = Joi.object({
  body: {
    questionId: Joi.string().max(200),
    GSI1SK: Joi.string().max(100),
    description: Joi.string().allow("").max(500).optional(),
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
  const { questionId, description, GSI1SK }: APICreateQuestionOptions =
    req.body;

  const [created, error] = await Questions.CreateQuestion({
    questionId,
    orgId: session.orgId,
    GSI1SK,
    description,
  });

  if (error) {
    let customMsg = "An error ocurred creating your question";
    if (error.name === "ConditionalCheckFailedException") {
      customMsg = "There is already a question with this ID.";
    }

    const { status, body } = CreateError.SDK(error, customMsg);
    return res.status(status).json(body);
  }
  return res.status(201).json({ message: "Question created!" });
};
export default main;
