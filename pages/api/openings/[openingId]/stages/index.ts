import { getAllStagesInOpening } from "../../../../../utils/openings/getAllStagesInOpening";
import { NextApiRequest, NextApiResponse } from "next";
import { withSessionRoute } from "../../../../../middleware/withSession";
import { API_METHODS } from "../../../../../defaults";
import withAuth from "../../../../../middleware/withAuth";
import withValidMethod from "../../../../../middleware/withValidMethod";
import { CUSTOM_QUERY } from "../../../../../types/main";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { method, query } = req;
  const { openingId } = query as Pick<CUSTOM_QUERY, "openingId">;

  // Get all stages in an opening
  if (method === API_METHODS.GET) {
    try {
      const allStages = await getAllStagesInOpening({
        openingId: openingId,
        orgId: req.session.user.orgId,
      });
      return res.status(200).json(allStages);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to retrieve stages: ${error}` });
    }
  }
};

export default withValidMethod(withSessionRoute(withAuth(handler)), [
  API_METHODS.GET,
]);
