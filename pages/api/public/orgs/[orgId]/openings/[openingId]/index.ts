// Returns some public info about an opening
// Such as the opening name, description, and stage order
import withCleanOrgId from "../../../../../../../middleware/withCleanOrgId";
import { NextApiResponse } from "next";
import cleanOpening from "../../../../../../../utils/clean/cleanOpening";
import { getOpening } from "../../../../../../../utils/openings/getOpeningById";
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query } = req;
  const { orgId, openingId } = query as CustomQuery;

  const getOpeningInput: GetOpeningInput = {
    orgId: orgId,
    openingId: openingId,
  };

  if (method === "GET") {
    try {
      const opening = await getOpening(getOpeningInput);
      if (!opening) {
        return res.status(404).json({ message: "Opening not found" });
      }

      if (!opening.isPublic) {
        return res
          .status(400)
          .json({ message: "You cannot apply here just yet" });
      }
      const cleanOpening = cleanOpening(opening as DynamoOpening);
      return res.status(200).json(cleanOpening);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to get opening: ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withCleanOrgId(handler);
