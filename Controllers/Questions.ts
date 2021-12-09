import { Request, Response } from "express";
import { createStageQuestion } from "../utils/questions/createStageQuestion";

export const create = async (req: Request, res: Response) => {
  const { GSI1SK, questionDescription, stageId } = req.body;

  const createStageQuestionInput = {
    orgId: req.session.user.orgId,
    stageId: stageId,
    GSI1SK: GSI1SK,
    questionDescription: questionDescription,
  };

  try {
    await createStageQuestion(createStageQuestionInput);
    return res.status(201).json({ message: "Question created!" });
  } catch (error) {
    // TODO add error logger
    return res
      .status(500) // TODO change #
      .json({ message: `Unable to create stage question: ${error}` });
  }
};
