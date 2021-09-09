import { NextApiRequest, NextApiResponse } from "next";
import { CreateOrg } from "../../../utils/orgs/createOrg";
import { GetOrg } from "../../../utils/orgs/getOrg";
import withCleanOrgName from "../../../middleware/withCleanOrgName";
import InputValidation from "../../../utils/inputValidation";
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body, method } = req;
  const { org_name, org_id } = body;
  // Create an org
  if (method === "POST") {
    const create_org_input: CreateOrgInput = {
      org_name: org_name,
      org_id: org_id,
    };

    try {
      InputValidation(create_org_input);
    } catch (error) {
      return res.status(400).json({ message: `${error.message}` });
    }
    try {
      const org = await CreateOrg(create_org_input);
      return res.status(201).json(org);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default handler;
