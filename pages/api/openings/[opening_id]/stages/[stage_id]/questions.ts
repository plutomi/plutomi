import { CreateStageQuestion } from "../../../../../../utils/stages/createStageQuestion";
import withAuthorizer from "../../../../../../middleware/withAuthorizer";
import { NextApiResponse } from "next";
import { DeleteQuestionInStage } from "../../../../../../utils/stages/deleteQuestionInStage";

const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { body, method, query } = req;
  const user: DynamoUser = req.user;
  const { question_title, question_description }: APICreateQuestionInput = body;
  const { stage_question_id }: APIDeleteQuestionInput = body;
  const { stage_id, opening_id } = query;

  if (method === "POST") {
    const create_stage_question_input: CreateStageQuestionInput = {
      org_id: user.org_id,
      opening_id: opening_id as string,
      stage_id: stage_id as string,
      question_title: question_title,
      question_description: question_description,
    };

    try {
      await CreateStageQuestion(create_stage_question_input);
      return res.status(201).json({ message: "Question created!" });
    } catch (error) {
      // TODO add error logger
      return res
        .status(500) // TODO change #
        .json({ message: `Unable to create stage question: ${error}` });
    }
  }
  if (method === "DELETE") {
    try {
      const delete_question_input: DeleteQuestionInput = {
        opening_id: opening_id as string,
        org_id: user.org_id,
        stage_id: stage_id as string,
        stage_question_id: stage_question_id,
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
