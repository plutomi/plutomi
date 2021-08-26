import { NextApiRequest, NextApiResponse } from "next";
import { CreateFunnel } from "../../../utils/funnels/createFunnel";
import { Clean } from "../../../utils/clean";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body, method } = req;
  const { org_id, funnel_name } = body;

  if (method === "POST") {
    try {
      const funnel = await CreateFunnel(org_id, funnel_name);
      return res.status(201).json(funnel);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to create funnel: ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default handler;
