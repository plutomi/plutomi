import { createStage } from "../../../utils/stages/createStage";
import InputValidation from "../../../utils/inputValidation";
import { NextApiRequest, NextApiResponse } from "next";
// Create stage in an opening
import { withSessionRoute } from "../../../middleware/withSession";
import { API_METHODS } from "../../../defaults";
import withAuth from "../../../middleware/withAuth";
import withCleanOrgId from "../../../middleware/withCleanOrgId";
import withValidMethod from "../../../middleware/withValidMethod";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const userSession = req.session.user;

  const { body, method } = req;
  const { GSI1SK, openingId } = body;

  if (method === API_METHODS.POST) {
    if (userSession.orgId === "NO_ORG_ASSIGNED") {
      return res.status(403).json({
        message: "Please create an organization before creating a stage",
      });
    }
    const createStageInput = {
      orgId: userSession.orgId,
      openingId: openingId,
      GSI1SK: GSI1SK,
    };

    try {
      InputValidation(createStageInput);
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
