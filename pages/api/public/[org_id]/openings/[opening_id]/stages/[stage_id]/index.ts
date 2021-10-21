// Returns some public info about an opening
// Such as the opening name, description, and stage order
import withCleanOrgName from "../../../../../../../../middleware/withCleanOrgName";
import { NextApiResponse } from "next";
import CleanStage from "../../../../../../../../utils/clean/cleanStage";
import { GetStageById } from "../../../../../../../../utils/stages/getStageById";
const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { method, query } = req;
  const { org_id, opening_id, stage_id } = query;

  const get_stage_input: GetStageByIdInput = {
    org_id: org_id as string,
    stage_id: stage_id as string,
  };

  if (method === "GET") {
    try {
      const stage = await GetStageById(get_stage_input);
      if (!stage) {
        return res.status(404).json({ message: "Stage not found" });
      }

      //   if (!stage.is_public) { // TODO add public and private stages?
      //     return res
      //       .status(400)
      //       .json({ message: "You cannot apply here just yet" });
      //   }
      const cleanStage = CleanStage(stage as DynamoStage);
      return res.status(200).json(cleanStage);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to get stage: ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withCleanOrgName(handler);
