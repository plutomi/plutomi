import withCleanOrgName from "../../../../middleware/withCleanOrgName";
import withAuthorizer from "../../../../middleware/withAuthorizer";
import { GetOrg } from "../../../../utils/orgs/getOrg";
import { NextApiResponse } from "next";

const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { method, query } = req;
  const user: DynamoUser = req.user;
  const { org_id } = query;

  if (method === "GET") {
    try {
      const org = await GetOrg(org_id as string);

      if (!org) {
        return res.status(404).json({ message: "Org not found" });
      }

      if (org.org_id != user.org_id) {
        return res
          .status(403)
          .json({ message: "You are not authorized to view this org" });
      }
      return res.status(200).json(org);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to retrieve org: ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withAuthorizer(withCleanOrgName(handler));
