import { NextApiRequest, NextApiResponse } from "next";
import { CreateStage } from "../../../utils/stages/createStage";
import { Clean } from "../../../utils/clean";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body, method } = req;
  const { org_id, funnel_id, stage_name } = body;

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

  return res.status(405).json({ message: "Not Allowed" });
};

export default handler;
