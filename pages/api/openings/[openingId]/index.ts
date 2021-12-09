import { getOpening } from "../../../../utils/openings/getOpeningById";
import { NextApiRequest, NextApiResponse } from "next";
import updateOpening from "../../../../utils/openings/updateOpening";
import { deleteOpening } from "../../../../utils/openings/deleteOpening";
import { withSessionRoute } from "../../../../middleware/withSession";
import { API_METHODS } from "../../../../Config";
import withAuth from "../../../../middleware/withAuth";
import withValidMethod from "../../../../middleware/withValidMethod";
import { CUSTOM_QUERY } from "../../../../types/main";
import Joi from "joi";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { method, query, body } = req;
  const { openingId } = query as Pick<CUSTOM_QUERY, "openingId">;

  if (method === API_METHODS.PUT) {
    try {
      const updateOpeningInput = {
        orgId: req.session.user.orgId,
        openingId: openingId,
        newOpeningValues: body.newOpeningValues,
      };

      const schema = Joi.object({
        orgId: Joi.string(),
        openingId: Joi.string(),
        newOpeningValues: Joi.object(), // TODO allow only specific values!!!
      }).options({ presence: "required" });

      // Validate input
      try {
        await schema.validateAsync(updateOpeningInput);
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
  }
};

export default withValidMethod(withSessionRoute(withAuth(handler)), [
  API_METHODS.GET,
  API_METHODS.PUT,
  API_METHODS.DELETE,
]);
