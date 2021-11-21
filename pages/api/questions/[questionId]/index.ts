import { NextApiRequest, NextApiResponse } from "next";
import { DeleteQuestion } from "../../../../utils/questions/deleteQuestion";
import InputValidation from "../../../../utils/inputValidation";
import updateQuestion from "../../../../utils/questions/updateStageQuestion";
import { withSessionRoute } from "../../../../middleware/withSession";
import { API_METHODS } from "../../../../Config";
import withAuth from "../../../../middleware/withAuth";
import withCleanOrgId from "../../../../middleware/withCleanOrgId";
import withValidMethod from "../../../../middleware/withValidMethod";
import { CUSTOM_QUERY, UpdateQuestionInput } from "../../../../types/main";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { body, method, query } = req;
  const { questionId } = query as Pick<CUSTOM_QUERY, "questionId">;

  if (method === API_METHODS.DELETE) {
    try {
      const deleteQuestionInput = {
        orgId: req.session.user.orgId,
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
        orgId: req.session.user.orgId,
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
};

export default withCleanOrgId(
  withValidMethod(withSessionRoute(withAuth(handler)), [
    API_METHODS.PUT,
    API_METHODS.DELETE,
  ])
);
