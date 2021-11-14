import { CreateStageQuestion } from "../../../utils/questions/createStageQuestion";
import { NextApiResponse } from "next";
import { withSessionRoute } from "../../../middleware/withSession";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const userSession = req.session.user;
  if (!userSession) {
    req.session.destroy();
    return res.status(401).json({ message: "Please log in again" });
  }
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
      await CreateStageQuestion(createStageQuestionInput);
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
