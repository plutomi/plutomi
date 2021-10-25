import withCleanOrgName from "../../../../middleware/withCleanOrgName";
import { GetOrg } from "../../../../utils/orgs/getOrg";
import { NextApiResponse } from "next";
import { GetAllUsersInOrg } from "../../../../utils/orgs/getAllUsersInOrg";
import { LeaveOrg } from "../../../../utils/users/leaveOrg";

import withSession from "../../../../middleware/withSession";
import CleanUser from "../../../../utils/clean/cleanUser";

const handler = async (
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> => {
  const user_session = req.session.get("user");
  if (!user_session) {
    req.session.destroy();
    return res.status(401).json({ message: "Please sign in again" });
  }
  const { method, query } = req;
  const { org_id } = query as CustomQuery;

  if (method === "GET") {
    // When signed in, this returns all data for an org
    // For public org data such as basic info or openings, please use the
    // /api/public/orgs/[org_id] route

    if (org_id != user_session.org_id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to view this org" });
    }

    try {
      const org = await GetOrg(org_id);

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

  if (method === "DELETE") {
    try {
      const all_org_users = await GetAllUsersInOrg({
        org_id: user_session.org_id,
        limit: 2,
      });

      if (all_org_users.length > 1) {
        return res.status(400).json({
          message: "You cannot delete this org as there are other users in it",
        });
      }

      const updated_user = await LeaveOrg(user_session.user_id);
      req.session.set("user", CleanUser(updated_user)); // Update the session with the new org value
      await req.session.save();
      return res
        .status(200)
        .json({ message: `You've deleted the ${org_id} org :(` });
    } catch (error) {
      // TODO add error logger
      return res
        .status(500) // TODO change #
        .json({
          message: `Unable to delete org - ${error}`,
        });
    }
  }
  return res.status(405).json({ message: "Not Allowed" });
};

export default withSession(withCleanOrgName(handler));
