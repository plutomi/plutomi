import { GetStage } from "../.././../../utils/stages/getStage";
import { NextApiResponse } from "next";
import InputValidation from "../.././../../utils/inputValidation";
import { DeleteStage } from "../.././../../utils/stages/deleteStage";
import UpdateStage from "../../../../utils/stages/updateStage";
// Create stage in a opening
import withSession from "../../../../middleware/withSession";

const handler = async (
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> => {
  const user_session = req.session.get("user");
  if (!user_session) {
    req.session.destroy();
    return res.status(401).json({ message: "Please log in again" });
  }
  const { method, query, body } = req;
  const { stage_id } = query as CustomQuery;
  const { openingId } = body;
  // Get a single stage in an opening
  if (method === "GET") {
    const get_stage_input: GetStageInput = {
      org_id: user_session.org_id,
      stage_id: stage_id,
    };

    try {
      const stage = await GetStage(get_stage_input);
      if (!stage) {
        return res.status(404).json({ message: "Stage not found" });
      }

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
        org_id: user_session.org_id,
        stage_id: stage_id,
        new_stage_values: body.new_stage_values,
      };

      try {
        InputValidation(update_stage_input);
      } catch (error) {
        return res.status(400).json({ message: `${error.message}` });
      }

      await UpdateStage(update_stage_input);
      return res.status(200).json({ message: "Stage updated!" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Unable to update stage - ${error}` });
    }
  }

  if (method === "DELETE") {
    try {
      const delete_stage_input = {
        org_id: user_session.org_id,
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

export default withSession(handler);
