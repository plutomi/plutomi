import { NextApiRequest, NextApiResponse } from "next";
import { CreateFunnel } from "../../../../../utils/funnels/createFunnel";
import { GetAllFunnelsInOrg } from "../../../../../utils/funnels/getAllFunnelsInOrg";
import withSessionId from "../../../../../middleware/withSessionId";
import withUserInOrg from "../../../../../middleware/withUserInOrg";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body, method, query } = req;
  const { funnel_name } = body;
  const { org_url_name } = query;

  if (method === "POST") {
    try {
      const create_funnel_input: CreateFunnelInput = {
        org_url_name: org_url_name as string,
        funnel_name: funnel_name,
      };

      let missing_keys = [];
      for (const [key, value] of Object.entries(create_funnel_input)) {
        if (value == undefined) {
          missing_keys.push(`'${key}'`);
        }
      }
      if (missing_keys.length > 0)
        return res.status(400).json({
          message: `Bad request: ${missing_keys.join(", ")} missing`,
        });

      const funnel = await CreateFunnel(create_funnel_input);
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
      const all_funnels = await GetAllFunnelsInOrg(org_url_name as string);
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
