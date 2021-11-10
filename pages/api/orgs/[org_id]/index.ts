import withCleanOrgId from "../../../../middleware/withCleanOrgId";
import { GetOrg } from "../../../../utils/orgs/getOrg";
import { NextApiResponse } from "next";
import { GetAllUsersInOrg } from "../../../../utils/orgs/getAllUsersInOrg";

import withSession from "../../../../middleware/withSession";
import CleanUser from "../../../../utils/clean/cleanUser";
import { UpdateUser } from "../../../../utils/users/updateUser";

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
  const org = await GetOrg(orgId);

  if (method === "GET") {
    // When signed in, this returns all data for an org
    // For public org data such as basic info or openings, please use the
    // /api/public/orgs/[orgId] route

    if (orgId != user_session.orgId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to view this org" });
    }

    try {
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
      if (org.total_users > 1) {
        return res.status(400).json({
          message: "You cannot delete this org as there are other users in it",
        });
      }

      const updated_user = await UpdateUser({
        userId: user_session.userId,
        new_user_values: {
          orgId: "NO_ORG_ASSIGNED",
          org_join_date: "NO_ORG_ASSIGNED",
          GSI1PK: "NO_ORG_ASSIGNED",
        },

        ALLOW_FORBIDDEN_KEYS: true,
      });
      req.session.set("user", CleanUser(updated_user)); // Update the session with the new org value
      await req.session.save();
      return res
        .status(200)
        .json({ message: `You've deleted the ${orgId} org :(` });
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

export default withSession(withCleanOrgId(handler));
