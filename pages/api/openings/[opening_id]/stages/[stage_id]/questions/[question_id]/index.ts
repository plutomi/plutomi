import withAuthorizer from "../../../../../../../../middleware/withAuthorizer";
import { NextApiResponse } from "next";
import { DeleteQuestionInStage } from "../../../../../../../../utils/questions/deleteQuestionInStage";
import InputValidation from "../../../../../../../../utils/inputValidation";
import UpdateQuestion from "../../../../../../../../utils/questions/updateStageQuestion";
const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { body, method, query } = req;
  const user: DynamoUser = req.user;
  const { GSI1SK, question_description }: APICreateQuestionInput = body;
  const { stage_id, opening_id, question_id } = query;

  if (method === "DELETE") {
    try {
      const delete_question_input: DeleteQuestionInput = {
        opening_id: opening_id as string,
        org_id: user.org_id,
        stage_id: stage_id as string,
        question_id: question_id as string,
      };
      await DeleteQuestionInStage(delete_question_input);
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
        opening_id: opening_id as string,
        stage_id: stage_id as string,
        question_id: question_id as string,
        updated_question: body.updated_question, // Just the keys that are passed down
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

export default withAuthorizer(handler);
