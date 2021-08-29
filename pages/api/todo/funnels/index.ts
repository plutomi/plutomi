import { NextApiRequest, NextApiResponse } from "next";
import { CreateFunnel } from "../../../../utils/funnels/createFunnel";
import { GetAllFunnelsInOrg } from "../../../../utils/funnels/getAllFunnelsInOrg";
import withSessionId from "../../../../middleware/withSessionId";
import withUserInOrg from "../../../../middleware/withUserInOrg";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body, method, query } = req;
  const { funnel_name } = body;
  const { user_info } = body;
  if (method === "POST") {
    try {
      const funnel = await CreateFunnel(user_info.org_url_name, funnel_name);
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
      const all_funnels = await GetAllFunnelsInOrg(
        user_info.org_url_name as string
      );
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

export default withSessionId(withUserInOrg(handler));
