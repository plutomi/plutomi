import { CreateStageQuestion } from "../../../utils/questions/createStageQuestion";
import { NextApiResponse } from "next";
import withSession from "../../../middleware/withSession";

const handler = async (
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> => {
  const user_session = req.session.get("user");
  if (!user_session) {
    req.session.destroy();
    return res.status(401).json({ message: "Please log in again" });
  }
  const { body, method } = req;
  const { GSI1SK, question_description, stage_id } = body;

  if (method === "POST") {
    const create_stage_question_input = {
      org_id: user_session.org_id,
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

export default withSession(handler);
