import { NextApiRequest, NextApiResponse } from "next";
import { CreateStageRule } from "../../../../utils/stages/createStageRule";
import withSessionId from "../../../../middleware/withSessionId";
import withUserInOrg from "../../../../middleware/withUserInOrg";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body, method } = req;
  const { org_id, stage_id, validation } = body;

  if (method === "POST") {
    try {
      const stage_rule = await CreateStageRule(org_id, stage_id, validation);
      return res.status(201).json(stage_rule);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to create stage_rule: ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withSessionId(withUserInOrg(handler));
