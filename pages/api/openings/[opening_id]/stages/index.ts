import { GetAllStagesInOpening } from "../../../../../utils/stages/getAllStagesInOpening";
import { CreateStage } from "../../../../../utils/stages/createStage";
import InputValidation from "../../../../../utils/inputValidation";
import { NextApiResponse } from "next";
import withSession from "../../../../../middleware/withSession";

async function handler(
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> {
  const user = req.session.get("user");
  if (!user) {
    req.session.destroy();
    return res.status(401).json({ message: "Please sign in again" });
  }
  const { body, method, query } = req;
  const { opening_id } = query as CustomQuery;

  // Get all stages in an opening
  if (method === "GET") {
    try {
      const all_stages = await GetAllStagesInOpening(user.org_id, opening_id);
      return res.status(200).json(all_stages);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to retrieve stages: ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
}

export default withSession(handler);
