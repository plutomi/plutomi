import { Request, Response } from "express";
import { UpdateQuestionInput } from "../types/main";
import * as Questions from "../models/Questions";
import Joi from "joi";
export const create = async (req: Request, res: Response) => {
  const { GSI1SK, questionDescription, stageId } = req.body;

  const createStageQuestionInput = {
    orgId: req.session.user.orgId,
    stageId: stageId,
    GSI1SK: GSI1SK,
    questionDescription: questionDescription,
  };

  try {
    await Questions.createQuestion(createStageQuestionInput);
    return res.status(201).json({ message: "Question created!" });
  } catch (error) {
    // TODO add error logger
    return res
      .status(500) // TODO change #
      .json({ message: `Unable to create stage question: ${error}` });
  }
};

export const deleteQuestion = async (req: Request, res: Response) => {
  const { questionId } = req.params;
  try {
    const deleteQuestionInput = {
      orgId: req.session.user.orgId,
      questionId: questionId,
    };
    await Questions.deleteQuestion(deleteQuestionInput);
    return res.status(200).json({ message: "Question deleted!" });
  } catch (error) {
    // TODO add error logger
    return res
      .status(500) // TODO change #
      .json({ message: `Unable to delete stage question: ${error}` });
  }
};

export const update = async (req: Request, res: Response) => {
  const { questionId } = req.params;
  const { newQuestionValues } = req.body;
  try {
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

    await Questions.updateQuestion(updatedQuestionInput);
    return res.status(200).json({ message: "Question updated!" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: `Unable to update question - ${error}` });
  }
};
