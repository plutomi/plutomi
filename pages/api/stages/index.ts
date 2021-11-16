import { createStage } from "../../../utils/stages/createStage";
import InputValidation from "../../../utils/inputValidation";
import { NextApiResponse } from "next";
// Create stage in an opening
import { withSessionRoute } from "../../../middleware/withSession";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const userSession = req.session.user;

  const { body, method } = req;
  const { GSI1SK, openingId }: APICreateStageInput = body;

  if (method === "POST") {
    if (userSession.orgId === "NO_ORG_ASSIGNED") {
      return res.status(403).json({
        message: "Please create an organization before creating a stage",
      });
    }
    const createStageInput: DynamoCreateStageInput = {
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

  return res.status(405).json({ message: "Not Allowed" });
};

export default withSessionRoute(handler);
