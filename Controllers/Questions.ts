import { Request, Response } from "express";
import { UpdateQuestionInput } from "../types/main";
import * as Questions from "../models/Questions/index";
import Joi from "joi";
import errorFormatter from "../utils/errorFormatter";
export const create = async (req: Request, res: Response) => {
  const { GSI1SK, questionDescription, stageId } = req.body;

  const createStageQuestionInput = {
    orgId: req.session.user.orgId,
    stageId: stageId,
    GSI1SK: GSI1SK,
    questionDescription: questionDescription,
  };

  const [created, error] = await Questions.createQuestion(
    createStageQuestionInput
  );
  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(error.$metadata.httpStatusCode).json({
      message: "An error ocurred creating question",
      ...formattedError,
    });
  }
  return res.status(201).json({ message: "Question created!" });
};

export const deleteQuestion = async (req: Request, res: Response) => {
  const { questionId } = req.params;

  const deleteQuestionInput = {
    orgId: req.session.user.orgId,
    questionId: questionId,
  };
  const [deleted, error] = await Questions.deleteQuestion(deleteQuestionInput);
  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(error.$metadata.httpStatusCode).json({
      message: "An error ocurred deleting that question",
      ...formattedError,
    });
  }
  return res.status(200).json({ message: "Question deleted!" });
};

export const update = async (req: Request, res: Response) => {
  const { questionId } = req.params;
  const { newQuestionValues } = req.body;

  const updatedQuestionInput: UpdateQuestionInput = {
    orgId: req.session.user.orgId,
    questionId: questionId,
    newQuestionValues: newQuestionValues, // Just the keys that are passed down
  };
  const schema = Joi.object({
    orgId: Joi.string(),
    questionId: Joi.string(),
    newQuestionValues: Joi.object(),
  }).options({ presence: "required" }); // TODo add actual inputs of new question values

  // Validate input
  try {
    await schema.validateAsync(updatedQuestionInput);
  } catch (error) {
    return res.status(400).json({ message: `${error.message}` });
  }

  const [updated, error] = await Questions.updateQuestion(updatedQuestionInput);

  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(error.$metadata.httpStatusCode).json({
      message: "An error ocurred updating that question",
      ...formattedError,
    });
  }
  return res.status(200).json({ message: "Question updated!" });
};
