import { GetAllUsersInOrg } from "../../../../utils/orgs/getAllUsersInOrg";
import withCleanOrgName from "../../../../middleware/withCleanOrgName";
import { NextApiResponse } from "next";

import withSession from "../../../../middleware/withSession";

async function handler(
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> {
  const user = req.session.get("user");
  if (!user) {
    req.session.destroy();
    return res.status(401).json({ message: "Please sign in again" });
  }
  const { method, query } = req;
  const { org_id } = query;

  if (method === "GET") {
    if (user.org_id != org_id) {
      // TODO team site bug returning 403 -- TODO I think this is fixed
      return res
        .status(403)
        .json({ message: "You cannot view the users of this org" });
    }

    if (user.org_id === "NO_ORG_ASSIGNED") {
      return res.status(400).json({
        message: "You must create an org or join one to view it's users",
      });
    }

    try {
      const all_users = await GetAllUsersInOrg(user.org_id);
      return res.status(200).json(all_users);
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Unable to retrieve users - ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
}

export default withSession(withCleanOrgName(handler));
