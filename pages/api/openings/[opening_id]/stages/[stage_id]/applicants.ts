import { NextApiResponse } from "next";
import { GetAllApplicantsInStage } from "../../../../../../utils/applicants/getAllApplicantsInStage";
import withSession from "../../../../../../middleware/withSession";

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
  const { stage_id, opening_id } = query as CustomQuery;
=======
=======
>>>>>>> dd45c08 (replaced next-auth with next-iron-session)
  const { method, query } = req;
<<<<<<< HEAD
  const { stage_id, opening_id } = query;
>>>>>>> 12d77e0 (Replaced withauthorizer with withSession)
=======
  const { stage_id, opening_id } = query as CustomQuery;
>>>>>>> ce0b1d8 (fix: Removed all 'as string' - #196)

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
