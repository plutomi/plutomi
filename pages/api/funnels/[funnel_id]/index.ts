import { GetOpening } from "../../../../utils/funnels/getFunnelById";
import withAuthorizer from "../../../../middleware/withAuthorizer";
import { NextApiResponse } from "next";

const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const user: DynamoUser = req.user;
  const { method, query } = req;
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

  return res.status(405).json({ message: "Not Allowed" });
};

export default withAuthorizer(handler);
