import { NextApiResponse } from "next";
import { GetAllStagesInOpening } from "../../utils/stages/getAllStagesInOpening";

const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { method, query } = req;
  const { key } = query;
  if (!key) {
    return res.status(400).json({ message: "Missing key" });
  }
  if ((key as string) != process.env.LATENCY_KEY) {
    return res.status(401).json({ message: "Invalid key >:[" });
  }
  if (method === "GET") {
    try {
      const stages = await GetAllStagesInOpening("grubhub", "eEWbN6hlqhCzZK5C");
      return res.status(200).json(stages);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to retrieve org: ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default handler;
