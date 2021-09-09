import { NextApiRequest, NextApiResponse } from "next";
import { GetStage } from "../../../../../../../../utils/stages/getStageById";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query } = req;
  const { org_id, funnel_id, stage_id } = query;

  const get_stage_input: GetStageInput = {
    org_id: org_id as string,
    funnel_id: funnel_id as string,
    stage_id: stage_id as string,
  };

  if (method === "GET") {
    try {
      const stage = await GetStage(get_stage_input); // TODO return also all rules & questions
      if (!stage) {
        return res.status(404).json({ message: "Stage not found" });
      }
      return res.status(200).json(stage);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to get stage: ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default handler;
