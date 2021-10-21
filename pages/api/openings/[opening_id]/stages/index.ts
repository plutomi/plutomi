import { GetAllStagesInOpening } from "../../../../../utils/stages/getAllStagesInOpening";
import withAuthorizer from "../../../../../middleware/withAuthorizer";
import { CreateStage } from "../../../../../utils/stages/createStage";
import InputValidation from "../../../../../utils/inputValidation";
import { NextApiResponse } from "next";
// Create stage in an opening
const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { body, method, query } = req;
  const { opening_id } = query;
  const user: DynamoUser = req.user;

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
};

export default withAuthorizer(handler);
