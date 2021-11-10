// Returns some public info about an opening
// Such as the opening name, description, and stage order
import withCleanOrgId from "../../../../../../../middleware/withCleanOrgId";
import { NextApiResponse } from "next";
import CleanOpening from "../../../../../../../utils/clean/cleanOpening";
import { GetOpening } from "../../../../../../../utils/openings/getOpeningById";
const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { method, query } = req;
  const { org_id, openingId } = query as CustomQuery;

  const get_opening_input: GetOpeningInput = {
    org_id: org_id,
    openingId: openingId,
  };

  if (method === "GET") {
    try {
      const opening = await GetOpening(get_opening_input);
      if (!opening) {
        return res.status(404).json({ message: "Opening not found" });
      }

      if (!opening.is_public) {
        return res
          .status(400)
          .json({ message: "You cannot apply here just yet" });
      }
      const cleanOpening = CleanOpening(opening as DynamoOpening);
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
