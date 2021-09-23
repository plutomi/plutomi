import { CreateStageRule } from "../../../../../../utils/stages/createStageRule";
import { GetStageById } from "../../../../../../utils/stages/getStageById";
import withAuthorizer from "../../../../../../middleware/withAuthorizer";
import InputValidation from "../../../../../../utils/inputValidation";
import { NextApiResponse } from "next";

const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { body, method, query } = req;
  const user: DynamoUser = req.user;
  const { validation }: APICreateRuleInput = body;
  const { stage_id } = query;

  if (method === "POST") {
    const stage = await GetStageById(stage_id); // TODO this needs to be updated
    if (!stage) {
      return res.status(400).json({ message: "That stage does not exist" });
    }
    const create_stage_rule_input: CreateStageRuleInput = {
      org_id: user.org_id,
      opening_id: stage.opening_id,
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

export default withAuthorizer(handler);
