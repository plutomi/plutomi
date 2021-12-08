import { getAllUsersInOrg } from "../../../../utils/orgs/getAllUsersInOrg";
import withCleanOrgId from "../../../../middleware/withCleanOrgId";
import { NextApiRequest, NextApiResponse } from "next";
import { withSessionRoute } from "../../../../middleware/withSession";
import { API_METHODS, DEFAULTS } from "../../../../Config";
import withAuth from "../../../../middleware/withAuth";
import withValidMethod from "../../../../middleware/withValidMethod";
import { CUSTOM_QUERY } from "../../../../types/main";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { method, query } = req;
  const { orgId } = query as Pick<CUSTOM_QUERY, "orgId">;

  if (method === API_METHODS.GET) {

};

export default withCleanOrgId(
  withValidMethod(withSessionRoute(withAuth(handler)), [API_METHODS.GET])
);
