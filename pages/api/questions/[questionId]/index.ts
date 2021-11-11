import { NextApiResponse } from "next";
import { DeleteQuestion } from "../../../../utils/questions/deleteQuestion";
import InputValidation from "../../../../utils/inputValidation";
import UpdateQuestion from "../../../../utils/questions/updateStageQuestion";
import withSession from "../../../../middleware/withSession";

const handler = async (
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> => {
  const user_session = req.session.get("user");
  if (!user_session) {
    req.session.destroy();
    return res.status(401).json({ message: "Please log in again" });
  }
  const { body, method, query } = req;
  const { question_id } = query as CustomQuery;

  if (method === "DELETE") {
    try {
      const delete_question_input = {
        orgId: user_session.orgId,
        question_id: question_id,
      };
      await DeleteQuestion(delete_question_input);
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
      const update_question_input: UpdateQuestionInput = {
        orgId: user_session.orgId,
        question_id: question_id,
        new_question_values: body.new_question_values, // Just the keys that are passed down
      };

      try {
        InputValidation(update_question_input);
      } catch (error) {
        return res.status(400).json({ message: `${error.message}` });
      }

      await UpdateQuestion(update_question_input);
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

export default withSession(handler);
