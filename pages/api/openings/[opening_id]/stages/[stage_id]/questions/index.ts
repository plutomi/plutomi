import { CreateStageQuestion } from "../../../../../../../utils/questions/createStageQuestion";
import withAuthorizer from "../../../../../../../middleware/withAuthorizer";
import { NextApiResponse } from "next";
import { DeleteQuestionInStage } from "../../../../../../../utils/questions/deleteQuestionInStage";

const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { body, method, query } = req;
  const user: DynamoUser = req.user;
  const { GSI1SK, question_description }: APICreateQuestionInput = body;
  const { stage_id, opening_id } = query;

  if (method === "POST") {
    const create_stage_question_input: CreateStageQuestionInput = {
      org_id: user.org_id,
      opening_id: opening_id as string,
      stage_id: stage_id as string,
      GSI1SK: GSI1SK,
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

  return res.status(405).json({ message: "Not Allowed" });
};

export default withAuthorizer(handler);
