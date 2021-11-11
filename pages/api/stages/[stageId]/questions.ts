import { NextApiResponse } from "next";
import { GetAllQuestionsInStage } from "../../../../utils/questions/getAllQuestionsInStage";
import withCleanOrgId from "../../../../middleware/withCleanOrgId";
import withSession from "../../../../middleware/withSession";

const handler = async (
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> => {
  const userSession = req.session.user;
  if (!userSession) {
    req.session.destroy();
    return res.status(401).json({ message: "Please log in again" });
  }
  const { method, query } = req;
  const { stageId } = query as CustomQuery;

  if (method === "GET") {
    try {
      const questions = await GetAllQuestionsInStage({
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

export default withSession(withCleanOrgId(handler));
