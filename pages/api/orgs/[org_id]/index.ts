import withCleanOrgName from "../../../../middleware/withCleanOrgName";
import withAuthorizer from "../../../../middleware/withAuthorizer";
import { GetOrg } from "../../../../utils/orgs/getOrg";
import { NextApiResponse } from "next";
import { GetAllUsersInOrg } from "../../../../utils/orgs/getAllUsersInOrg";
import { LeaveOrg } from "../../../../utils/users/leaveOrg";

const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { method, query } = req;
  const user: DynamoUser = req.user;
  const { org_id } = query;

  if (method === "GET") {
    // When signed in, this returns all data for an org
    // For public org data such as basic info or openings, please use the
    // /api/public/orgs/[org_id] route

    if (org_id != user.org_id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to view this org" });
    }

    try {
      const org = await GetOrg(org_id as string);

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
      // TODO add a limit to this so we can just check if 2 are returned
      const all_org_users = await GetAllUsersInOrg(user?.org_id);

      if (all_org_users.length > 1) {
        return res.status(400).json({
          message: "You cannot delete this org as there are other users in it",
        });
      }

      await LeaveOrg(user.user_id);
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

export default withAuthorizer(withCleanOrgName(handler));
