import { NextApiRequest, NextApiResponse } from "next";
import { SanitizeResponse } from "../../../utils/sanitizeResponse";
import { GetFunnel } from "../../../utils/funnels/getFunnelById";
import withSessionId from "../../../middleware/withSessionId";
import withUserInOrg from "../../../middleware/withUserInOrg";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query } = req;
  const { funnel_id, org_id } = query;

  if (method === "GET") {
    try {
      // TODO this comes from session????
      // TODO TODO TODO !!!! FROM SESSION IF FROM API GET THE ORG ID FIRST!!!!!!
      const funnel = await GetFunnel(org_id as string, funnel_id as string);
      if (!funnel) {
        return res.status(404).json({ message: "Funnel not found" });
      }
      return res.status(200).json(funnel);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to create funnel: ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withSessionId(withUserInOrg(handler));
