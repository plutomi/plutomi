import { GetStageById } from "../../../../../../utils/stages/getStageById";
import withAuthorizer from "../../../../../../middleware/withAuthorizer";
import { NextApiResponse } from "next";
import InputValidation from "../../../../../../utils/inputValidation";
import { DeleteStage } from "../.././../../../../utils/stages/deleteStage";
import UpdateStage from "../../../../../../utils/stages/updateStage";
// Create stage in a opening
const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { method, query, body } = req;
  const user: DynamoUser = req.user;
  const { opening_id, stage_id } = query;

  // Get a single stage in an opening
  if (method === "GET") {
    const get_stage_input: GetStageByIdInput = {
      org_id: user.org_id,
      opening_id: opening_id as string,
      stage_id: stage_id as string,
    };

    try {
      const stage = await GetStageById(get_stage_input);
      return res.status(200).json(stage);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to retrieve stage: ${error}` });
    }
  }

  if (method === "PUT") {
    try {
      const update_stage_input: UpdateStageInput = {
        org_id: user.org_id,
        opening_id: opening_id as string,
        stage_id: stage_id as string,
        updated_stage: body.updated_stage,
      };

      try {
        InputValidation(update_stage_input);
      } catch (error) {
        return res.status(400).json({ message: `${error.message}` });
      }

      await UpdateStage(update_stage_input);
      return res.status(200).json({ message: "Opening updated!" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Unable to update opening - ${error}` });
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
