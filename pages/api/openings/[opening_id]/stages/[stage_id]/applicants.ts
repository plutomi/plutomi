import { NextApiResponse } from "next";
import { GetAllApplicantsInStage } from "../../../../../../utils/applicants/getAllApplicantsInStage";
import withSession from "../../../../../../middleware/withSession";

async function handler(
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> {
  const user = req.session.get("user");
<<<<<<< HEAD
  if (!user) {
    req.session.destroy();
    return res.status(401).json({ message: "Please sign in again" });
  }
  const { method, query } = req;
  const { stage_id, opening_id } = query as CustomQuery;
=======
  const { method, query } = req;
  const { stage_id, opening_id } = query;
>>>>>>> 12d77e0 (Replaced withauthorizer with withSession)

  // Get all applicants in a stage
  if (method === "GET") {
    const get_all_applicants_in_stage_input: GetAllApplicantsInStageInput = {
      org_id: user.org_id,
      opening_id: opening_id,
      stage_id: stage_id,
    };

    try {
      const all_applicants = await GetAllApplicantsInStage(
        get_all_applicants_in_stage_input
      );
      return res.status(200).json(all_applicants);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to retrieve applicants: ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
}

export default withSession(handler);
