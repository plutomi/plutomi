import { NextApiRequest, NextApiResponse } from "next";
import { GetFunnel } from "../../../utils/funnels/getFunnelById";
import withSessionId from "../../../middleware/withSessionId";
import withUserInOrg from "../../../middleware/withUserInOrg";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query, body } = req;
  const { funnel_id } = query;
  const { user_info } = body;

  if (method === "GET") {
    try {
      const funnel = await GetFunnel(user_info.org_id, funnel_id as string);

      if (!funnel) return res.status(404).json({ message: "Funnel not found" });

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
