import { NextApiResponse } from "next";
import { createStageQuestion } from "../../../utils/questions/createStageQuestion";
import { withSessionRoute } from "../../../middleware/withSession";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const userSession = req.session.user;

  const { body, method } = req;
  const { GSI1SK, questionDescription, stageId } = body;

  if (method === "POST") {
    const createStageQuestionInput = {
      orgId: userSession.orgId,
      stageId: stageId,
      GSI1SK: GSI1SK,
      questionDescription: questionDescription,
    };

    try {
      await createStageQuestion(createStageQuestionInput);
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

export default withSessionRoute(handler);
