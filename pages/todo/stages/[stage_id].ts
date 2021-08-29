import { NextApiRequest, NextApiResponse } from "next";
import { GetStage } from "../../../../utils/stages/getStageById";
import withSessionId from "../../../../middleware/withSessionId";
import withUserInOrg from "../../../../middleware/withUserInOrg";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query, body } = req;
  const { stage_id } = query;
  const { user_info } = body;

  if (method === "GET") {
    try {
      const org = await GetStage(user_info.org_url_name, stage_id as string);
      if (!org) {
        return res.status(404).json({ message: "Org not found" });
      }
      return res.status(200).json(org);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to create stage: ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withSessionId(withUserInOrg(handler));
