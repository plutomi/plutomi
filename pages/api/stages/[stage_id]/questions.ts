import { NextApiResponse } from "next";
import { GetAllQuestionsInStage } from "../../../../utils/questions/getAllQuestionsInStage";
import withCleanOrgName from "../../../../middleware/withCleanOrgName";
import withAuthorizer from "../../../../middleware/withAuthorizer";
const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { method, query } = req;
  const user: DynamoUser = req.user;
  const { stage_id } = query;

  if (method === "GET") {
    try {
      const questions = await GetAllQuestionsInStage({
        org_id: user.org_id,
        stage_id,
      });

      return res.status(200).json(questions);
    } catch (error) {
      return res.status(500).json({ message: "Unable to retrieve questions" });
    }
  }
  return res.status(405).json({ message: "Not Allowed" });
};

export default withAuthorizer(withCleanOrgName(handler));
