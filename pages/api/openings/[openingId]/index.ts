import { GetOpening } from "../../../../utils/openings/getOpeningById";
import { NextApiResponse } from "next";
import InputValidation from "../../../../utils/inputValidation";
import UpdateOpening from "../../../../utils/openings/updateOpening";
import { DeleteOpening } from "../../../../utils/openings/deleteOpening";
import { withSessionRoute } from "../../../../middleware/withSession";

const handler = async (
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> => {
  const userSession = req.session.user;
  if (!userSession) {
    req.session.destroy();
    return res.status(401).json({ message: "Please log in again" });
  }
  const { method, query, body } = req;
  const { openingId } = query as CustomQuery;

  const get_opening_input: GetOpeningInput = {
    orgId: userSession.orgId,
    openingId: openingId,
  };

  if (method === "GET") {
    try {
      const opening = await GetOpening(get_opening_input);
      if (!opening) {
        return res.status(404).json({ message: "Opening not found" });
      }

      return res.status(200).json(opening);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to get opening: ${error}` });
    }
  }

  if (method === "PUT") {
    try {
      const update_opening_input: UpdateOpeningInput = {
        orgId: userSession.orgId,
        openingId: openingId,
        new_opening_values: body.new_opening_values,
      };

      try {
        InputValidation(update_opening_input);
      } catch (error) {
        return res.status(400).json({ message: `${error.message}` });
      }

      await UpdateOpening(update_opening_input);
      return res.status(200).json({ message: "Opening updated!" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Unable to update opening - ${error}` });
    }
  }

  if (method === "DELETE") {
    try {
      const delete_opening_input = {
        orgId: userSession.orgId,
        openingId: openingId,
      };
      await DeleteOpening(delete_opening_input);
      return res.status(200).json({ message: "Opening deleted" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Unable to delete your opening ${error}` });
    }
  }
  return res.status(405).json({ message: "Not Allowed" });
};

export default withSessionRoute(handler);
