import { NextApiRequest, NextApiResponse } from "next";
import { CreateStage } from "../../../../../../../utils/stages/createStage";
import { GetAllStagesInOrg } from "../../../../../../../utils/stages/getAllStagesInOrg";
import withSessionId from "../../../../../../../middleware/withSessionId";
import withUserInOrg from "../../../../../../../middleware/withUserInOrg";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body, method, query } = req;
  const { funnel_id, org_url_name } = query;
  const { stage_name } = body;

  const create_stage_input: CreateStageInput = {
    org_url_name: org_url_name as string,
    funnel_id: funnel_id as string,
    stage_name: stage_name,
  };

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

  if (method === "GET") {
    try {
      const all_funnels = await GetAllStagesInOrg(org_url_name as string);
      return res.status(200).json(all_funnels);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to retrieve funnels: ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default handler;
