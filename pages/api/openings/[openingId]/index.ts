import { getOpening } from "../../../../utils/openings/getOpeningById";
import { NextApiRequest, NextApiResponse } from "next";
import InputValidation from "../../../../utils/inputValidation";
import updateOpening from "../../../../utils/openings/updateOpening";
import { deleteOpening } from "../../../../utils/openings/deleteOpening";
import { withSessionRoute } from "../../../../middleware/withSession";
import { API_METHODS } from "../../../../defaults";
import withAuth from "../../../../middleware/withAuth";
import withValidMethod from "../../../../middleware/withValidMethod";
import { CUSTOM_QUERY } from "../../../../Types";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const userSession = req.session.user;
  const { method, query, body } = req;
  const { openingId } = query as Pick<CUSTOM_QUERY, "openingId">;

  if (method === API_METHODS.GET) {
    try {
      const opening = await getOpening({ openingId, orgId: userSession.orgId });
      if (!opening) {
        return res.status(404).json({ message: "Opening not found" });
      }

      return res.status(200).json(opening);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to get opening: ${error}` });
    }
  }

  if (method === API_METHODS.PUT) {
    try {
      const updateOpeningInput = {
        orgId: userSession.orgId,
        openingId: openingId,
        newOpeningValues: body.newOpeningValues,
      };

      try {
        InputValidation(updateOpeningInput);
      } catch (error) {
        return res.status(400).json({ message: `${error.message}` });
      }

      await updateOpening(updateOpeningInput);
      return res.status(200).json({ message: "Opening updated!" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Unable to update opening - ${error}` });
    }
  }

  if (method === API_METHODS.DELETE) {
    try {
      const deleteOpeningInput = {
        orgId: userSession.orgId,
        openingId: openingId,
      };
      await deleteOpening(deleteOpeningInput);
      return res.status(200).json({ message: "Opening deleted" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Unable to delete your opening ${error}` });
    }
  }
};

export default withValidMethod(withSessionRoute(withAuth(handler)), [
  API_METHODS.GET,
  API_METHODS.PUT,
  API_METHODS.DELETE,
]);
