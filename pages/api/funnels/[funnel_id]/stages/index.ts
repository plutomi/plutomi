import { NextApiRequest, NextApiResponse } from "next";
import { CreateStage } from "../../../../../utils/stages/createStage";
import { GetAllStagesInFunnel } from "../../../../../utils/stages/getAllStagesInFunnel";
import InputValidation from "../../../../../utils/inputValidation";
import withAuthorizer from "../../../../../middleware/withAuthorizer";
// Create stage in a funnel
const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { method, user, query } = req;
  const { funnel_id } = query;

  // Get all stages in a funnel // TODO

  if (method === "GET") {
    try {
      const all_stages = await GetAllStagesInFunnel(user.org_id, funnel_id);

      return res.status(200).json(all_stages);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to retrieve stages: ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withAuthorizer(handler);
