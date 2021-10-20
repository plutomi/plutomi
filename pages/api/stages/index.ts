import withAuthorizer from "../../../middleware/withAuthorizer";
import { CreateStage } from "../../../utils/stages/createStage";
import InputValidation from "../../../utils/inputValidation";
import { NextApiResponse } from "next";
// Create stage in an opening
const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { body, method, query } = req;
  const { GSI1SK, opening_id }: APICreateStageInput = body;
  const user: DynamoUser = req.user;

  if (method === "POST") {
    if (user.org_id === "NO_ORG_ASSIGNED") {
      return res.status(403).json({
        message: "Please create an organization before creating a stage",
      });
    }
    const create_stage_input: CreateStageInput = {
      org_id: user.org_id,
      opening_id: opening_id,
      GSI1SK: GSI1SK as string,
    };

    try {
      InputValidation(create_stage_input);
    } catch (error) {
      return res.status(400).json({ message: `${error.message}` });
    }

    try {
      const created_stage = await CreateStage(create_stage_input);
      return res
        .status(201)
        .json({ message: "Stage created", stage: created_stage });
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to create stage: ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withAuthorizer(handler);
