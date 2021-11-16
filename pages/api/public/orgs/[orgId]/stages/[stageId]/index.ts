// Returns some public info about an opening
// Such as the opening name, description, and stage order
import withCleanOrgId from "../../../../../../../middleware/withCleanOrgId";
import { NextApiRequest, NextApiResponse } from "next";
import { getStageById } from "../../../../../../../utils/stages/getStageById";
import cleanStage from "../../../../../../../utils/clean/cleanStage";
import { API_METHODS } from "../../../../../../../defaults";
import withValidMethod from "../../../../../../../middleware/withValidMethod";
import { CUSTOM_QUERY } from "../../../../../../../Types";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query } = req;
  const { orgId, stageId } = query as Pick<CUSTOM_QUERY, "orgId" | "stageId">;

  if (method === API_METHODS.GET) {
    try {
      const stage = await getStageById({ orgId, stageId });
      if (!stage) {
        return res.status(404).json({ message: "Stage not found" });
      }

      //   if (!stage.isPublic) { // TODO add public and private stages?
      //     return res
      //       .status(400)
      //       .json({ message: "You cannot apply here just yet" });
      //   }
      const cleanedStage = cleanStage(stage);
      return res.status(200).json(cleanedStage);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to get stage: ${error}` });
    }
  }
};

export default withCleanOrgId(withValidMethod(handler, [API_METHODS.GET]));
