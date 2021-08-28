import { NextApiRequest, NextApiResponse } from "next";
import { SanitizeResponse } from "../../../utils/sanitizeResponse";
import { GetOrg } from "../../../utils/orgs/getOrg";
import withSessionId from "../../../middleware/withSessionId";
import withUserInOrg from "../../../middleware/withUserInOrg";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query, body } = req;
  const { user_info } = body;

  if (method === "GET") {
    try {
      const org = await GetOrg(user_info.org_id);
      if (!org) {
        return res.status(404).json({ message: "Org not found" });
      }
      SanitizeResponse(org);
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

export default withSessionId(withUserInOrg(handler));
