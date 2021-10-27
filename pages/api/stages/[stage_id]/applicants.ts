import { NextApiResponse } from "next";
import { GetAllApplicantsInStage } from "../../../../utils/applicants/getAllApplicantsInStage";
import withSession from "../../../../middleware/withSession";
import { GetStage } from "../../../../utils/stages/getStage";

const handler = async (
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> => {
  const user_session = req.session.get("user");
  if (!user_session) {
    req.session.destroy();
    return res.status(401).json({ message: "Please sign in again" });
  }
  const { method, query } = req;
  const { stage_id } = query as CustomQuery;

  // Get all applicants in a stage - NOTE - To query this, you must get the opening ID as well.
  // TODO note v
  // Before, we had this call under the openings/opening_id/stages/stage_id/applicants and found that was a bit.. annoying.
  // It made more sense to make an extra DB call here to be able to get applicants in a stage with just the stage ID
  // TODO note ^
  if (method === "GET") {
    const stage = await GetStage({
      org_id: user_session.org_id,
      stage_id: stage_id,
    });
    const get_all_applicants_in_stage_input: GetAllApplicantsInStageInput = {
      org_id: user_session.org_id,
      opening_id: stage.opening_id,
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
};

export default withSession(handler);
