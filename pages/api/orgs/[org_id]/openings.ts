// All public openings for the org
import withCleanOrgName from "../../../../middleware/withCleanOrgName";

import { GetOrg } from "../../../../utils/orgs/getOrg";
import { NextApiResponse } from "next";
import { GetAllOpeningsInOrg } from "../../../../utils/openings/getAllOpeningsInOrg";

const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { method, query } = req;
  const { org_id } = query;

  console.log("ORG ID", org_id);
  if (method === "GET") {
    try {
      const all_openings = await GetAllOpeningsInOrg(org_id as string);
      const only_public = all_openings.filter(
        (opening): DynamoOpening => opening.is_public
      );

      return res.status(200).json(only_public);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to retrieve org: ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withCleanOrgName(handler);
