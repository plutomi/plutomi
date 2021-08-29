import { NextApiRequest, NextApiResponse } from "next";
import { CreateStage } from "../../../../utils/stages/createStage";
import { GetAllStagesInOrg } from "../../../../utils/stages/getAllStagesInOrg";
import withSessionId from "../../../../middleware/withSessionId";
import withUserInOrg from "../../../../middleware/withUserInOrg";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body, method } = req;
  const { user_info, funnel_id, stage_name }: CreateStageAPIInput = body;

  if (method === "POST") {
    try {
      const stage = await CreateStage(
        user_info.org_url_name,
        stage_name,
        funnel_id
      );
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
      const all_funnels = await GetAllStagesInOrg(user_info.org_url_name);
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

export default withSessionId(withUserInOrg(handler));
