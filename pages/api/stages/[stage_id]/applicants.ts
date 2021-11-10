import { NextApiResponse } from "next";
import { GetAllApplicantsInStage } from "../../../../utils/stages/getAllApplicantsInStage";
import withSession from "../../../../middleware/withSession";
import { GetStage } from "../../../../utils/stages/getStage";

const handler = async (
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> => {
  const user_session = req.session.get("user");
  if (!user_session) {
    req.session.destroy();
    return res.status(401).json({ message: "Please log in again" });
  }
  const { method, query } = req;
  const { stage_id } = query as CustomQuery;

  if (method === "GET") {
    const get_all_applicants_in_stage_input = {
      orgId: user_session.orgId,
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
