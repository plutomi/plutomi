import { NextApiRequest, NextApiResponse } from "next";
import { DeleteQuestion } from "../../../../utils/questions/deleteQuestion";
import InputValidation from "../../../../utils/inputValidation";
import updateQuestion from "../../../../utils/questions/updateStageQuestion";
import { withSessionRoute } from "../../../../middleware/withSession";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const userSession = req.session.user;

  const { body, method, query } = req;
  const { questionId } = query as Pick<CUSTOM_QUERY, "questionId">;

  if (method === API_METHODS.DELETE) {
    try {
      const deleteQuestionInput = {
        orgId: userSession.orgId,
        questionId: questionId,
      };
      await DeleteQuestion(deleteQuestionInput);
      return res.status(200).json({ message: "Question deleted!" });
    } catch (error) {
      // TODO add error logger
      return res
        .status(500) // TODO change #
        .json({ message: `Unable to delete stage question: ${error}` });
    }
  }

  if (method === API_METHODS.PUT) {
    try {
      const updatedQuestionInput: UpdateQuestionInput = {
        orgId: userSession.orgId,
        questionId: questionId,
        newQuestionValues: body.newQuestionValues, // Just the keys that are passed down
      };

      try {
        InputValidation(updatedQuestionInput);
      } catch (error) {
        return res.status(400).json({ message: `${error.message}` });
      }

      await updateQuestion(updatedQuestionInput);
      return res.status(200).json({ message: "Question updated!" });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: `Unable to update question - ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withSessionRoute(handler);
