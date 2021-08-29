import { NextApiRequest, NextApiResponse } from "next";
import { CreateStageRule } from "../../../../../../../../utils/stages/createStageRule";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body, method, query } = req;
  const { validation } = body;
  const { org_url_name, funnel_id, stage_id } = query;

  if (method === "POST") {
    const create_stage_rule_input: CreateStageRuleInput = {
      org_url_name: org_url_name as string,
      funnel_id: funnel_id as string,
      stage_id: stage_id as string,
      validation: validation,
    };

    let missing_keys = [];
    for (const [key, value] of Object.entries(create_stage_rule_input)) {
      if (value == undefined) {
        missing_keys.push(`'${key}'`);
      }
    }
    if (missing_keys.length > 0)
      return res.status(400).json({
        message: `Bad request: ${missing_keys.join(", ")} missing`,
      });

    try {
      const stage_question = await CreateStageRule(create_stage_rule_input);
      return res.status(201).json(stage_question);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to create stage rule: ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default handler;
