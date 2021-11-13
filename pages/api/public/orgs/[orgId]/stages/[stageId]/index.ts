// Returns some public info about an opening
// Such as the opening name, description, and stage order
import withCleanOrgId from "../../../../../../../middleware/withCleanOrgId";
import { NextApiResponse } from "next";
import CleanStage from "../../../../../../../utils/clean/cleanStage";
import { getStage } from "../../../../../../../utils/stages/getStage";
const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { method, query } = req;
  const { orgId, openingId, stageId } = query as CustomQuery;

  const get_stage_input: GetStageInput = {
    orgId: orgId,
    stageId: stageId,
  };

  if (method === "GET") {
    try {
      const stage = await GetStage(get_stage_input);
      if (!stage) {
        return res.status(404).json({ message: "Stage not found" });
      }

      //   if (!stage.isPublic) { // TODO add public and private stages?
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

export default withCleanOrgId(handler);
