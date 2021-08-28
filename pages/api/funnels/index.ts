import { NextApiRequest, NextApiResponse } from "next";
import { CreateFunnel } from "../../../utils/funnels/createFunnel";
import { SanitizeResponse } from "../../../utils/sanitizeResponse";
import { GetAllFunnelsInOrg } from "../../../utils/funnels/getAllFunnelsInOrg";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body, method, query } = req;
  const { org_id, funnel_name } = body;
  const query_org_id = query.org_id; // TODO fix, use session

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

  if (method === "GET") {
    try {
      const all_funnels = await GetAllFunnelsInOrg(query_org_id as string);
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
