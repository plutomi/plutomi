import withCleanOrgId from "../../../../../middleware/withCleanOrgId";
import { getOrg } from "../../../../../utils/orgs/getOrg";
import { NextApiRequest, NextApiResponse } from "next";
import { API_METHODS, ENTITY_TYPES } from "../../../../../Config";
import withValidMethod from "../../../../../middleware/withValidMethod";
import { CUSTOM_QUERY } from "../../../../../types/main";
import Sanitize from "../../../../../utils/sanitize";
// This returns limited public information about an org
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query } = req;
  const { orgId } = query as Pick<CUSTOM_QUERY, "orgId">;

  if (method === API_METHODS.GET) {

  }
};

export default withCleanOrgId(withValidMethod(handler, [API_METHODS.GET]));
