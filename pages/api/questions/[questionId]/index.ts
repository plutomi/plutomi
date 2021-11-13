import { NextApiResponse } from "next";
import { DeleteQuestion } from "../../../../utils/questions/deleteQuestion";
import InputValidation from "../../../../utils/inputValidation";
import UpdateQuestion from "../../../../utils/questions/updateStageQuestion";
import { withSessionRoute } from "../../../../middleware/withSession";

const handler = async (
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> => {
  const userSession = req.session.user;
  if (!userSession) {
    req.session.destroy();
    return res.status(401).json({ message: "Please log in again" });
  }
  const { body, method, query } = req;
  const { questionId } = query as CustomQuery;

  if (method === "DELETE") {
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

  if (method === "PUT") {
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

      await UpdateQuestion(updatedQuestionInput);
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
