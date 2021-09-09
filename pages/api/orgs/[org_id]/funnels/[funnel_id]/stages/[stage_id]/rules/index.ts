import { NextApiRequest, NextApiResponse } from "next";
import { CreateStageRule } from "../../../../../../../../../utils/stages/createStageRule";
import InputValidation from "../../../../../../../../../utils/inputValidation";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body, method, query } = req;
  const { validation } = body;
  const { org_id, funnel_id, stage_id } = query;

  if (method === "POST") {
    const create_stage_rule_input: CreateStageRuleInput = {
      org_id: org_id as string,
      funnel_id: funnel_id as string,
      stage_id: stage_id as string,
      validation: validation,
    };

    try {
      InputValidation(create_stage_rule_input);
    } catch (error) {
      return res.status(400).json({ message: `${error.message}` });
    }
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
