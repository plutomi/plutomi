import { NextApiResponse } from "next";
import withCleanOrgName from "../../../../middleware/withCleanOrgName";
import withAuthorizer from "../../../../middleware/withAuthorizer";
import { GetAllUsersInOrg } from "../../../../utils/orgs/getAllUsersInOrg";
const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { method, query, user } = req;
  const { org_id } = query;

  if (method === "GET") {
    if (user.org_id != org_id) {
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
};

export default withAuthorizer(withCleanOrgName(handler));
