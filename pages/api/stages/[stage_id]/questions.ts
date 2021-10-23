import { NextApiResponse } from "next";
import { GetAllQuestionsInStage } from "../../../../utils/questions/getAllQuestionsInStage";
import withCleanOrgName from "../../../../middleware/withCleanOrgName";
import withSession from "../../../../middleware/withSession";

async function handler(
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> {
  const user = req.session.get("user");
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> dd45c08 (replaced next-auth with next-iron-session)
  if (!user) {
    req.session.destroy();
    return res.status(401).json({ message: "Please sign in again" });
  }
<<<<<<< HEAD
  const { method, query } = req;
  const { stage_id } = query as CustomQuery;
=======
=======
>>>>>>> dd45c08 (replaced next-auth with next-iron-session)
  const { method, query } = req;
<<<<<<< HEAD
  const { stage_id } = query;
>>>>>>> 12d77e0 (Replaced withauthorizer with withSession)
=======
  const { stage_id } = query as CustomQuery;
>>>>>>> ce0b1d8 (fix: Removed all 'as string' - #196)

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
}

export default withSession(withCleanOrgName(handler));
