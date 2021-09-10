import { NextApiRequest, NextApiResponse } from "next";
import { GetStageById } from "../../../../utils/stages/getStageById";
import withAuthorizer from "../../../../middleware/withAuthorizer";
const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { method, query, user, body } = req;
  const { org_id, stage_id } = query;

  if (method === "GET") {
    const get_stage_input: GetStageByIdInput = {
      org_id: user.org_id,
      stage_id: stage_id as string,
    };
    try {
      const stage = await GetStageById(get_stage_input);
      if (!stage) {
        return res.status(404).json({ message: "Stage not found" });
      }
      return res.status(200).json(stage);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to get stage: ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withAuthorizer(handler);
