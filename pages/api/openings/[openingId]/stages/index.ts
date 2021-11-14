import { getAllStagesInOpening } from "../../../../../utils/openings/getAllStagesInOpening";
import { createStage } from "../../../../../utils/stages/createStage";
import InputValidation from "../../../../../utils/inputValidation";
import { NextApiResponse } from "next";
import { withSessionRoute } from "../../../../../middleware/withSession";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const userSession = req.session.user;
  if (!userSession) {
    req.session.destroy();
    return res.status(401).json({ message: "Please log in again" });
  }
  const { body, method, query } = req;
  const { openingId } = query as CustomQuery;

  // Get all stages in an opening
  if (method === "GET") {
    try {
      const allStages = await getAllStagesInOpening(
        userSession.orgId,
        openingId
      );
      return res.status(200).json(allStages);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to retrieve stages: ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withSessionRoute(handler);
