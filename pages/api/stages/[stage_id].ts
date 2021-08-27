import { NextApiRequest, NextApiResponse } from "next";
import { Clean } from "../../../utils/clean";
import { GetStage } from "../../../utils/stages/getStageById";
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query } = req;
  const { stage_id, org_id } = query;

  if (method === "GET") {
    try {
      // TODO this comes from session????
      // TODO TODO TODO !!!! FROM SESSION IF FROM API GET THE ORG ID FIRST!!!!!!
      const org = await GetStage(org_id as string, stage_id as string);
      if (!org) {
        return res.status(404).json({ message: "Org not found" });
      }
      return res.status(200).json(org);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to create org: ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default handler;
