import { getAllOpeningsInOrg } from "../../../utils/openings/getAllOpeningsInOrg";
import { createOpening } from "../../../utils/openings/createOpening";
import { NextApiRequest, NextApiResponse } from "next";
import { withSessionRoute } from "../../../middleware/withSession";
import { API_METHODS, DEFAULTS } from "../../../Config";
import withAuth from "../../../middleware/withAuth";
import withValidMethod from "../../../middleware/withValidMethod";
import Joi from "joi";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { body, method } = req;
  const { GSI1SK } = body;

  if (method === API_METHODS.POST) {
    if (req.session.user.orgId === DEFAULTS.NO_ORG) {
      return res.status(403).json({
        message: "Please create an organization before creating an opening",
      });
    }

    console.log("Incoming create opening", req.body);
    try {
      const createOpeningInput = {
        orgId: req.session.user.orgId,
        GSI1SK: GSI1SK,
      };
      const schema = Joi.object({
        orgId: Joi.string(),
        GSI1SK: Joi.string(),
      }).options({ presence: "required" });

      // Validate input
      try {
        await schema.validateAsync(createOpeningInput);
      } catch (error) {
        return res.status(400).json({ message: `${error.message}` });
      }

      await createOpening(createOpeningInput);
      return res.status(201).json({ message: "Opening created!" });
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to create opening: ${error}` });
    }
  }

  if (method === API_METHODS.GET) {
    try {
      const allOpenings = await getAllOpeningsInOrg({
        orgId: req.session.user.orgId,
      });
      return res.status(200).json(allOpenings);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to retrieve openings: ${error}` });
    }
  }
};

export default withValidMethod(withSessionRoute(withAuth(handler)), [
  API_METHODS.GET,
  API_METHODS.POST,
]);
