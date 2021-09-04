import { NextApiRequest, NextApiResponse } from "next";
import { CreateOrg } from "../../../../utils/orgs/createOrg";
import { GetOrg } from "../../../../utils/orgs/getOrg";
import withCleanOrgName from "../../../../middleware/withCleanOrgName";
import InputValidation from "../../../../utils/inputValidation";
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query } = req;
  const { org_url_name } = query;

  if (method === "GET") {
    try {
      const org = await GetOrg(org_url_name as string);
      if (!org) {
        return res.status(404).json({ message: "Org not found" });
      }
      return res.status(200).json(org);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to retrieve org: ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withCleanOrgName(handler);
