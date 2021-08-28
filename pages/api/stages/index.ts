import { NextApiRequest, NextApiResponse } from "next";
import { CreateStage } from "../../../utils/stages/createStage";
import { SanitizeResponse } from "../../../utils/sanitizeResponse";
import { GetAllStagesInOrg } from "../../../utils/stages/getAllStagesInOrg";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body, method, query } = req;
  const { org_id, funnel_id, stage_name } = body;
  const query_org_id = query.org_id; // TODO fix, use session

  if (method === "POST") {
    try {
      const stage = await CreateStage(org_id, stage_name, funnel_id);
      return res.status(201).json(stage);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to create stage: ${error}` });
    }
  }

  if (method === "GET") {
    try {
      const all_funnels = await GetAllStagesInOrg(query_org_id as string);
      return res.status(200).json(all_funnels);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to retrieve funnels: ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default handler;
