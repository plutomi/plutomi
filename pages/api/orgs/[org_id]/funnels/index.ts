import { NextApiRequest, NextApiResponse } from "next";
import { CreateFunnel } from "../../../../../utils/funnels/createFunnel";
import { GetAllFunnelsInOrg } from "../../../../../utils/funnels/getAllFunnelsInOrg";
import InputValidation from "../../../../../utils/inputValidation";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body, method, query } = req;
  const { funnel_name } = body;
  const { org_id } = query;

  if (method === "POST") {
    try {
      const create_funnel_input: CreateFunnelInput = {
        org_id: org_id as string,
        funnel_name: funnel_name,
      };

      try {
        InputValidation(create_funnel_input);
      } catch (error) {
        return res.status(400).json({ message: `${error.message}` });
      }

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
      const all_funnels = await GetAllFunnelsInOrg(org_id as string);
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
