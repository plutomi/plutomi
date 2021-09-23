import { GetAllFunnelsInOrg } from "../../../utils/funnels/getAllFunnelsInOrg";
import { CreateFunnel } from "../../../utils/funnels/createFunnel";
import withAuthorizer from "../../../middleware/withAuthorizer";
import InputValidation from "../../../utils/inputValidation";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { body, method } = req;
  const user: DynamoUser = req.user;
  const { funnel_name }: APICreateFunnelInput = body;

  if (method === "POST") {
    if (user.org_id === "NO_ORG_ASSIGNED") {
      return res.status(403).json({
        message: "Please create an organization before creating a funnel",
      });
    }
    try {
      const create_funnel_input: CreateFunnelInput = {
        org_id: user.org_id,
        funnel_name: funnel_name,
      };

      try {
        InputValidation(create_funnel_input);
      } catch (error) {
        return res.status(400).json({ message: `${error.message}` });
      }

      await CreateFunnel(create_funnel_input);
      return res.status(201).json({ message: "Funnel created!" });
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to create funnel: ${error}` });
    }
  }

  if (method === "GET") {
    try {
      const all_funnels = await GetAllFunnelsInOrg(user.org_id);
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

export default withAuthorizer(handler);
