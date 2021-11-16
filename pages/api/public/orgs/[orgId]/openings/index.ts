// All public openings for the org
import withCleanOrgId from "../../../../../../middleware/withCleanOrgId";
import { NextApiRequest, NextApiResponse } from "next";
import { getAllOpeningsInOrg } from "../../../../../../utils/openings/getAllOpeningsInOrg";
import cleanOpening from "../../../../../../utils/clean/cleanOpening";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query } = req;
  const { orgId } = query as Pick<CUSTOM_QUERY, "orgId">;

  if (method === "GET") {
    try {
      const allOpenings = await getAllOpeningsInOrg(orgId);
      const publicOpenings = allOpenings.filter((opening) => opening.isPublic);

      publicOpenings.forEach((opening) =>
        cleanOpening(opening as DynamoOpening)
      );

      return res.status(200).json(publicOpenings);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to retrieve org: ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withCleanOrgId(handler);
