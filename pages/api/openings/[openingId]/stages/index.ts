import { getAllStagesInOpening } from "../../../../../utils/openings/getAllStagesInOpening";
import { NextApiRequest, NextApiResponse } from "next";
import { withSessionRoute } from "../../../../../middleware/withSession";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const userSession = req.session.user;

  const { method, query } = req;
  const { openingId } = query as Pick<CUSTOM_QUERY, "openingId">;

  // Get all stages in an opening
  if (method === API_METHODS.GET) {
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
