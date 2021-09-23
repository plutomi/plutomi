import { GetAllStagesInFunnel } from "../../../../../utils/stages/getAllStagesInFunnel";
import withAuthorizer from "../../../../../middleware/withAuthorizer";
import { CreateStage } from "../../../../../utils/stages/createStage";
import InputValidation from "../../../../../utils/inputValidation";
import { NextApiResponse } from "next";

// Create stage in a funnel
const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { body, method, query } = req;
  const { stage_name } = body;
  const { funnel_id } = query;
  const user: DynamoUser = req.user;

  if (method === "POST") {
    if (user.org_id === "NO_ORG_ASSIGNED") {
      return res.status(403).json({
        message: "Please create an organization before creating a stage",
      });
    }
    const create_stage_input: CreateStageInput = {
      org_id: user.org_id,
      funnel_id: funnel_id as string,
      stage_name: stage_name as string,
    };

    try {
      InputValidation(create_stage_input);
    } catch (error) {
      return res.status(400).json({ message: `${error.message}` });
    }
    let missing_keys = [];
    for (const [key, value] of Object.entries(create_stage_input)) {
      if (value == undefined) {
        missing_keys.push(`'${key}'`);
      }
    }
    if (missing_keys.length > 0)
      return res.status(400).json({
        message: `Bad request: ${missing_keys.join(", ")} missing`,
      });

    try {
      // TODO **MAJOR** Do not allow creation of stages with the same name
      const stage = await CreateStage(create_stage_input);
      return res.status(201).json({ message: "Stage created!" });
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to create stage: ${error}` });
    }
  }

  // Get all stages in a funnel // TODO

  if (method === "GET") {
    try {
      const all_stages = await GetAllStagesInFunnel(user.org_id, funnel_id);
      console.log("ALL STAGES");
      return res.status(200).json(all_stages);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to retrieve stages: ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withAuthorizer(handler);
