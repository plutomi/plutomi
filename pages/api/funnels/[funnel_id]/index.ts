import { NextApiRequest, NextApiResponse } from "next";
import { GetFunnel } from "../../../../utils/funnels/getFunnelById";
import withAuthorizer from "../../../../middleware/withAuthorizer";

const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { method, query, user } = req;
  const { funnel_id } = query;

  const get_funnel_input: GetFunnelInput = {
    org_id: user.org_id,
    funnel_id: funnel_id as string,
  };
  if (method === "GET") {
    try {
      const funnel = await GetFunnel(get_funnel_input);
      if (!funnel) return res.status(404).json({ message: "Funnel not found" });

      return res.status(200).json(funnel);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to get funnel: ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withAuthorizer(handler);
