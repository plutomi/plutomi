import { GetStageById } from "../../../../../../utils/stages/getStageById";
import withAuthorizer from "../../../../../../middleware/withAuthorizer";
import { NextApiResponse } from "next";
import { DeleteStage } from "../.././../../../../utils/stages/deleteStage";
// Create stage in a opening
const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { method, query } = req;
  const user: DynamoUser = req.user;
  const { opening_id, stage_id } = query;

  console.log("Incoming method", method);
  // Get a single stage in an opening
  if (method === "GET") {
    const get_stage_input: GetStageByIdInput = {
      org_id: user.org_id,
      opening_id: opening_id as string,
      stage_id: stage_id as string,
    };
    console.log("Getting single stage", get_stage_input);

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

  if (method === "DELETE") {
    console.log("Deleting stage");
    try {
      const delete_stage_input = {
        org_id: user.org_id,
        opening_id: opening_id,
        stage_id: stage_id,
      };

      await DeleteStage(delete_stage_input);

      return res.status(200).json({ message: "Stage deleted!" });
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to delete your stage: ${error}` });
    }
  }
  return res.status(405).json({ message: "Not Allowed" });
};

export default withAuthorizer(handler);
