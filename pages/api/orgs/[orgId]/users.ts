import { GetAllUsersInOrg } from "../../../../utils/orgs/getAllUsersInOrg";
import withCleanOrgId from "../../../../middleware/withCleanOrgId";
import { NextApiResponse } from "next";

import withSession from "../../../../middleware/withSession";

const handler = async (
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> => {
  const user_session = req.session.get("user");
  if (!user_session) {
    req.session.destroy();
    return res.status(401).json({ message: "Please log in again" });
  }
  const { method, query } = req;
  const { orgId } = query as CustomQuery;

  if (method === "GET") {
    if (user_session.orgId != orgId) {
      // TODO team site bug returning 403 -- TODO I think this is fixed
      return res
        .status(403)
        .json({ message: "You cannot view the users of this org" });
    }

    if (user_session.orgId === "NO_ORG_ASSIGNED") {
      return res.status(400).json({
        message: "You must create an org or join one to view it's users",
      });
    }

    try {
      const all_users = await GetAllUsersInOrg({ orgId: user_session.orgId });
      return res.status(200).json(all_users);
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Unable to retrieve users - ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withSession(withCleanOrgId(handler));
