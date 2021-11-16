import { NextApiRequest, NextApiResponse } from "next";
import { createStageQuestion } from "../../../utils/questions/createStageQuestion";
import { withSessionRoute } from "../../../middleware/withSession";
import { API_METHODS } from "../../../defaults";
import withAuth from "../../../middleware/withAuth";
import withCleanOrgId from "../../../middleware/withCleanOrgId";
import withValidMethod from "../../../middleware/withValidMethod";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { body, method } = req;
  const { GSI1SK, questionDescription, stageId } = body;

  if (method === API_METHODS.POST) {
    const createStageQuestionInput = {
      orgId: req.session.user.orgId,
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
};

export default withCleanOrgId(
  withValidMethod(withSessionRoute(withAuth(handler)), [API_METHODS.POST])
);
