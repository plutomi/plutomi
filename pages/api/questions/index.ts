import { CreateStageQuestion } from "../../../utils/questions/createStageQuestion";
import withAuthorizer from "../../../middleware/withAuthorizer";
import { NextApiResponse } from "next";

const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { body, method } = req;
  const user: DynamoUser = req.user;
  const { GSI1SK, question_description, stage_id } = body;

  if (method === "POST") {
    const create_stage_question_input = {
      org_id: user.org_id,
      stage_id: stage_id,
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
