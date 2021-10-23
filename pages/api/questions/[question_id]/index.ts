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
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> dd45c08 (replaced next-auth with next-iron-session)
  if (!user) {
    req.session.destroy();
    return res.status(401).json({ message: "Please sign in again" });
  }
<<<<<<< HEAD
  const { body, method, query } = req;
  const { question_id } = query as CustomQuery;
=======
=======
>>>>>>> dd45c08 (replaced next-auth with next-iron-session)
  const { body, method, query } = req;
<<<<<<< HEAD
  const { question_id } = query;
>>>>>>> 12d77e0 (Replaced withauthorizer with withSession)
=======
  const { question_id } = query as CustomQuery;
>>>>>>> ce0b1d8 (fix: Removed all 'as string' - #196)

  if (method === "DELETE") {
    try {
      const delete_question_input = {
        org_id: user.org_id,
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
        org_id: user.org_id,
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
}

export default withSession(handler);
