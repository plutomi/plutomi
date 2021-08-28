import { NextApiRequest, NextApiResponse } from "next";
import { CreateStageQuestion } from "../../../../utils/stages/createStageQuestion";
import withSessionId from "../../../../middleware/withSessionId";
import withUserInOrg from "../../../../middleware/withUserInOrg";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body, method } = req;
  const { stage_id, question_title, user_info } = body;

  if (method === "POST") {
    try {
      const stage_question = await CreateStageQuestion(
        user_info.org_id,
        stage_id,
        question_title
      );
      return res.status(201).json(stage_question);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to create stage_question: ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withSessionId(withUserInOrg(handler));
