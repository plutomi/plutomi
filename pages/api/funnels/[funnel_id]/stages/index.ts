import { NextApiRequest, NextApiResponse } from "next";
import { CreateStage } from "../../../../../utils/stages/createStage";
import { GetAllStagesInFunnel } from "../../../../../utils/stages/getAllStagesInFunnel";
import InputValidation from "../../../../../utils/inputValidation";
import withAuthorizer from "../../../../../middleware/withAuthorizer";
// Create stage in a funnel
const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { body, method, user } = req;
  const { stage_name, funnel_id } = body;

  const create_stage_input: CreateStageInput = {
    org_id: user.org_id,
    funnel_id: funnel_id as string,
    stage_name: stage_name,
  };

  try {
    InputValidation(create_stage_input);
  } catch (error) {
    return res.status(400).json({ message: `${error.message}` });
  }

  if (method === "POST") {
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
      return res.status(201).json(stage);
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
      const all_stages = await GetAllStagesInFunnel(funnel_id, user.org_id);
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
