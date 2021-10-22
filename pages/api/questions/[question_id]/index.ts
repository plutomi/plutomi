import { NextApiResponse } from "next";
import { DeleteQuestion } from "../../../../utils/questions/deleteQuestion";
import InputValidation from "../../../../utils/inputValidation";
import UpdateQuestion from "../../../../utils/questions/updateStageQuestion";
import withSession from "../../../../middleware/withSession";

async function handler(
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> {
  const user = req.session.get("user");
  const { body, method, query } = req;
  const { question_id } = query;

  if (method === "DELETE") {
    try {
      const delete_question_input = {
        org_id: user.org_id,
        question_id: question_id as string,
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
        org_id: user.org_id,
        question_id: question_id as string,
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
}

export default withSession(handler);
