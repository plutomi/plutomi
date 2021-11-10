import { CreateStage } from "../../../utils/stages/createStage";
import InputValidation from "../../../utils/inputValidation";
import { NextApiResponse } from "next";
// Create stage in an opening
import withSession from "../../../middleware/withSession";

const handler = async (
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> => {
  const user_session = req.session.get("user");
  if (!user_session) {
    req.session.destroy();
    return res.status(401).json({ message: "Please log in again" });
  }
  const { body, method } = req;
  const { GSI1SK, openingId }: APICreateStageInput = body;

  if (method === "POST") {
    if (user_session.orgId === "NO_ORG_ASSIGNED") {
      return res.status(403).json({
        message: "Please create an organization before creating a stage",
      });
    }
    const create_stage_input: DynamoCreateStageInput = {
      orgId: user_session.orgId,
      openingId: openingId,
      GSI1SK: GSI1SK,
    };

    try {
      InputValidation(create_stage_input);
    } catch (error) {
      return res.status(400).json({ message: `${error.message}` });
    }

    try {
      await CreateStage(create_stage_input);
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

export default withSession(handler);
