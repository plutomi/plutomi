// All public openings for the org
import withCleanOrgName from "../../../../../middleware/withCleanOrgName";
import { NextApiResponse } from "next";
import { GetAllOpeningsInOrg } from "../../../../../utils/openings/getAllOpeningsInOrg";
import CleanOpening from "../../../../../utils/clean/cleanOpening";

const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { method, query } = req;
  const { org_id } = query;

  if (method === "GET") {
    try {
      const all_openings = await GetAllOpeningsInOrg(org_id as string);
      const only_public = all_openings.filter(
        (opening): DynamoOpening => opening.is_public
      );

      only_public.forEach((opening) => CleanOpening(opening as DynamoOpening));

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
