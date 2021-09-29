import { CreateStageQuestion } from "../../../../../../../../utils/questions/createStageQuestion";
import withAuthorizer from "../../../../../../../../middleware/withAuthorizer";
import { NextApiResponse } from "next";
import { DeleteQuestionInStage } from "../../../../../../../../utils/questions/deleteQuestionInStage";

const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { body, method, query } = req;
  const user: DynamoUser = req.user;
  const { question_title, question_description }: APICreateQuestionInput = body;
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

  return res.status(405).json({ message: "Not Allowed" });
};

export default withAuthorizer(handler);
