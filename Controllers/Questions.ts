import { Request, Response } from "express";
import { DeleteQuestionInput, UpdateQuestionInput } from "../types/main";
import * as Questions from "../models/Questions/index";
import * as Stages from "../models/Stages/index";
import Joi from "joi";
import errorFormatter from "../utils/errorFormatter";
import { ERRORS, LIMITS } from "../Config";
export const create = async (req: Request, res: Response) => {
  const { GSI1SK, questionDescription, stageId } = req.body;
  const { orgId } = req.session.user;

  let [stage, stageError] = await Stages.getStageById({ orgId, stageId });

  if (stageError) {
    const formattedError = errorFormatter(stageError);
    return res.status(stageError.$metadata.httpStatusCode).json({
      message:
        "An error ocurred creating question, unable to retrieve stage info",
      ...formattedError,
    });
  }
  if (stage.questionOrder.length >= LIMITS.MAX_CHILD_ENTITY_LIMIT) {
    return res
      .status(403)
      .json({ message: ERRORS.MAX_CHILD_ENTITY_LIMIT_ERROR_MESSAGE });
  }

  const createStageQuestionInput = {
    orgId: req.session.user.orgId,
    stageId: stageId,
    GSI1SK: GSI1SK,
    questionDescription: questionDescription,
    questionOrder: stage.questionOrder,
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
  const { orgId } = req.session.user;

  let [question, questionError] = await Questions.getQuestionById({
    orgId,
    questionId,
  });

  if (questionError) {
    const formattedError = errorFormatter(questionError);
    return res.status(questionError.$metadata.httpStatusCode).json({
      message:
        "An error ocurred deleting that question, unable to retrieve question info",
      ...formattedError,
    });
  }

  let [stage, stageError] = await Stages.getStageById({
    orgId,
    stageId: question.stageId,
  });
  if (stageError) {
    const formattedError = errorFormatter(stageError);
    return res.status(stageError.$metadata.httpStatusCode).json({
      message:
        "An error ocurred deleting that question, unable to retrieve stage info",
      ...formattedError,
    });
  }

  const deletedQuestionIndex = stage.questionOrder.indexOf(questionId);

  const deleteQuestionInput: DeleteQuestionInput = {
    orgId: req.session.user.orgId,
    questionId: questionId,
    stageId: stage.stageId,
    questionOrder: stage.questionOrder,
    deletedQuestionIndex: deletedQuestionIndex,
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
