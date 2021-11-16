import withCleanOrgId from "../../../../../middleware/withCleanOrgId";
import { getOrg } from "../../../../../utils/orgs/getOrg";
import { NextApiRequest, NextApiResponse } from "next";
import { API_METHODS } from "../../../../../defaults";
import withValidMethod from "../../../../../middleware/withValidMethod";
import { CUSTOM_QUERY } from "../../../../../Types";
// This returns limited public information about an org
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query } = req;
  const { orgId } = query as Pick<CUSTOM_QUERY, "orgId">;

  if (method === API_METHODS.GET) {
    try {
      const org = await getOrg(orgId);

      if (!org) {
        return res.status(404).json({ message: "Org not found" });
      }

      const cleanedOrg = cleanOrg(org); // TODO fix clean org

      return res.status(200).json(cleanedOrg);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to retrieve org: ${error}` });
    }
  }
};

export default withCleanOrgId(withValidMethod(handler, [API_METHODS.GET]));
