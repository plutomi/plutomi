import { getAllUsersInOrg } from "../../../../utils/orgs/getAllUsersInOrg";
import withCleanOrgId from "../../../../middleware/withCleanOrgId";
import { NextApiResponse } from "next";

import { withSessionRoute } from "../../../../middleware/withSession";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const userSession = req.session.user;
  if (!userSession) {
    req.session.destroy();
    return res.status(401).json({ message: "Please log in again" });
  }
  const { method, query } = req;
  const { orgId } = query as CUSTOM_QUERY;

  if (method === "GET") {
    if (userSession.orgId != orgId) {
      // TODO team site bug returning 403 -- TODO I think this is fixed
      return res
        .status(403)
        .json({ message: "You cannot view the users of this org" });
    }

    if (userSession.orgId === "NO_ORG_ASSIGNED") {
      return res.status(400).json({
        message: "You must create an org or join one to view it's users",
      });
    }

    try {
      const allUsers = await getAllUsersInOrg(userSession.orgId);
      return res.status(200).json(allUsers);
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Unable to retrieve users - ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withSessionRoute(withCleanOrgId(handler));
