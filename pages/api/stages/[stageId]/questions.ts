import { NextApiRequest, NextApiResponse } from "next";
import { getAllQuestionsInStage } from "../../../../utils/questions/getAllQuestionsInStage";
import withCleanOrgId from "../../../../middleware/withCleanOrgId";
import { withSessionRoute } from "../../../../middleware/withSession";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const userSession = req.session.user;

  const { method, query } = req;
  const { stageId } = query as Pick<CUSTOM_QUERY, "stageId">;

  if (method === "GET") {
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
  return res.status(405).json({ message: "Not Allowed" });
};

export default withSessionRoute(withCleanOrgId(handler));
