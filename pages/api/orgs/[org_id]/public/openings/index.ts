// All public openings for the org
import withCleanOrgName from "../../../../../../middleware/withCleanOrgName";

import { GetOrg } from "../../../../../../utils/orgs/getOrg";
import { NextApiResponse } from "next";
import { GetAllOpeningsInOrg } from "../../../../../../utils/openings/getAllOpeningsInOrg";

const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { method, query } = req;
  const { org_id } = query;

  if (method === "GET") {
    try {
      const all_openings = await GetAllOpeningsInOrg(org_id as string);
      const only_public = all_openings.filter(
        (opening): DynamoOpening => opening.is_public
      );

      // Determine which keys should be allowed to be sent back
      // Since these are public openings, we should only send back basic info
      // ie: NOT how many applicants there are

      const safeKeys = ["GSI1SK", "opening_id", "created_at", "stage_order"];
      only_public.forEach((opening) => {
        Object.keys(opening).forEach(
          (key) => safeKeys.includes(key) || delete opening[key]
        );
      });

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
