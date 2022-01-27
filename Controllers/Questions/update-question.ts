import { Request, Response } from "express";
import Joi from "joi";
import * as Openings from "../../models/Openings";
import * as CreateError from "../../utils/createError";
import * as Questions from "../../models/Questions";
import {
  JOI_GLOBAL_FORBIDDEN,
  JOI_SETTINGS,
  OPENING_STATE,
} from "../../Config";
import { UpdateOpeningInput } from "../../types/main";
import { DynamoNewQuestion } from "../../types/dynamo";

export type APIUpdateQuestionOptions = Partial<
  Pick<DynamoNewQuestion, "GSI1SK" | "description">
>;

const JOI_FORBIDDEN_OPENING = Joi.object({
  ...JOI_GLOBAL_FORBIDDEN,
  questionId: Joi.any().forbidden(),
  GSI1PK: Joi.any().forbidden(),
  GSI1SK: Joi.string().optional(),
  description: Joi.string().allow("").max(500).optional(),
});

const schema = Joi.object({
  body: JOI_FORBIDDEN_OPENING,
}).options(JOI_SETTINGS);

const main = async (req: Request, res: Response) => {
  try {
    await schema.validateAsync(req);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }

  const { session } = res.locals;
  const { questionId } = req.params;

  const [question, questionError] = await Questions.UpdateQuestion({
    orgId: session.orgId,
    questionId,
    newValues: req.body,
  });

  if (questionError) {
    const { status, body } = CreateError.SDK(
      questionError,
      "An error ocurred updating this question"
    );
    return res.status(status).json(body);
  }

  return res.status(200).json({
    message: "Question updated!",
  });
};

export default main;
