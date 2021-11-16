// Returns some public info about an opening
// Such as the opening name, description, and stage order
import withCleanOrgId from "../../../../../../../middleware/withCleanOrgId";
import { NextApiRequest, NextApiResponse } from "next";
import { getOpening } from "../../../../../../../utils/openings/getOpeningById";
import cleanOpening from "../../../../../../../utils/clean/cleanOpening";
import { API_METHODS } from "../../../../../../../defaults";
import withValidMethod from "../../../../../../../middleware/withValidMethod";
import { CUSTOM_QUERY } from "../../../../../../../types/main";
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query } = req;
  const { orgId, openingId } = query as Pick<
    CUSTOM_QUERY,
    "orgId" | "openingId"
  >;

  const getOpeningInput: GetOpeningInput = {
    orgId: orgId,
    openingId: openingId,
  };

  if (method === API_METHODS.GET) {
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
      const cleanedOpening = cleanOpening(opening);
      return res.status(200).json(cleanedOpening);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to get opening: ${error}` });
    }
  }
};

export default withCleanOrgId(withValidMethod(handler, [API_METHODS.GET]));
