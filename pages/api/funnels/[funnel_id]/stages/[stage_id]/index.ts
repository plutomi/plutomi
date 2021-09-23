import { GetStageById } from "../../../../../../utils/stages/getStageById";
import withAuthorizer from "../../../../../../middleware/withAuthorizer";
import { NextApiResponse } from "next";

// Create stage in a funnel
const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { method, query } = req;
  const user: DynamoUser = req.user;
  const { funnel_id, stage_id } = query;

  const get_stage_input: GetStageByIdInput = {
    org_id: user.org_id,
    funnel_id: funnel_id as string,
    stage_id: stage_id as string,
  };

  console.log("Getting single stage", get_stage_input);
  // Get a single stage in a funnel
  if (method === "GET") {
    try {
      const stage = await GetStageById(get_stage_input);
      console.log("All stages", stage);
      return res.status(200).json(stage);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to retrieve stage: ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withAuthorizer(handler);
