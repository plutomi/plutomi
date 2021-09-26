import { GetOpening } from "../../../../utils/openings/getOpeningById";
import withAuthorizer from "../../../../middleware/withAuthorizer";
import { NextApiResponse } from "next";
import ReorderStages from "../../../../utils/openings/reorderStagesInOpening";
const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const user: DynamoUser = req.user;
  const { method, query, body } = req;
  const { opening_id } = query;

  const get_opening_input: GetOpeningInput = {
    org_id: user.org_id,
    opening_id: opening_id as string,
  };

  if (method === "GET") {
    try {
      const opening = await GetOpening(get_opening_input);
      if (!opening)
        return res.status(404).json({ message: "Opening not found" });

      return res.status(200).json(opening);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to get opening: ${error}` });
    }
  }

  if (method === "PATCH") {
    const { new_stage_order } = body;

    if (!new_stage_order || new_stage_order.length == 0) {
      return res.status(400).json({ message: "Missing new stage order" });
    }

    const reorder_stages_input: ReorderStagesInput = {
      org_id: user.org_id,
      opening_id: opening_id,
      new_stage_order: body.new_stage_order,
    };

    try {
      await ReorderStages(reorder_stages_input);
      return res.status(200).json({ message: "Stage order updated!" });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: `Unable to reorder stages ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withAuthorizer(handler);
