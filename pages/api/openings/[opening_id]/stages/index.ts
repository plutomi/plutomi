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
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> dd45c08 (replaced next-auth with next-iron-session)
  if (!user) {
    req.session.destroy();
    return res.status(401).json({ message: "Please sign in again" });
  }
<<<<<<< HEAD
  const { body, method, query } = req;
  const { opening_id } = query as CustomQuery;
=======
=======
>>>>>>> dd45c08 (replaced next-auth with next-iron-session)
  const { body, method, query } = req;
<<<<<<< HEAD
  const { opening_id } = query;
>>>>>>> 12d77e0 (Replaced withauthorizer with withSession)
=======
  const { opening_id } = query as CustomQuery;
>>>>>>> ce0b1d8 (fix: Removed all 'as string' - #196)

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
