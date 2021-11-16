import { NextApiRequest, NextApiResponse } from "next";
import { getAllQuestionsInStage } from "../../../../utils/questions/getAllQuestionsInStage";
import withCleanOrgId from "../../../../middleware/withCleanOrgId";
import { withSessionRoute } from "../../../../middleware/withSession";
import { API_METHODS } from "../../../../defaults";
import withAuth from "../../../../middleware/withAuth";
import withValidMethod from "../../../../middleware/withValidMethod";
import { CUSTOM_QUERY } from "../../../../Types";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const userSession = req.session.user;

  const { method, query } = req;
  const { stageId } = query as Pick<CUSTOM_QUERY, "stageId">;

  if (method === API_METHODS.GET) {
    try {
      const questions = await getAllQuestionsInStage({
        orgId: userSession.orgId,
        stageId,
      });

      return res.status(200).json(questions);
    } catch (error) {
      return res.status(500).json({ message: "Unable to retrieve questions" });
    }
  }
};

export default withCleanOrgId(
  withValidMethod(withSessionRoute(withAuth(handler)), [API_METHODS.GET])
);
