import { createStage } from "../../../utils/stages/createStage";
import { NextApiRequest, NextApiResponse } from "next";
// Create stage in an opening
import { withSessionRoute } from "../../../middleware/withSession";
import { API_METHODS, DEFAULTS } from "../../../Config";
import withAuth from "../../../middleware/withAuth";
import withCleanOrgId from "../../../middleware/withCleanOrgId";
import withValidMethod from "../../../middleware/withValidMethod";
import Joi from "joi";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { body, method } = req;
  const { GSI1SK, openingId } = body;

  if (method === API_METHODS.POST) {
    if (req.session.user.orgId === DEFAULTS.NO_ORG) {
      return res.status(403).json({
        message: "Please create an organization before creating a stage",
      });
    }
    const createStageInput = {
      orgId: req.session.user.orgId,
      openingId: openingId,
      GSI1SK: GSI1SK,
    };

    const schema = Joi.object({
      orgId: Joi.string(),
      openingId: Joi.string(),
      GSI1SK: Joi.string(),
    }).options({ presence: "required" }); // TODo add actual inputs of new question values

    // Validate input
    try {
      await schema.validateAsync(createStageInput);
    } catch (error) {
      return res.status(400).json({ message: `${error.message}` });
    }
    
    try {
      await createStage(createStageInput);
      return res.status(201).json({ message: "Stage created" });
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to create stage: ${error}` });
    }
  }
};

export default withCleanOrgId(
  withValidMethod(withSessionRoute(withAuth(handler)), [API_METHODS.POST])
);
