import { GetOpening } from "../../../../utils/openings/getOpeningById";
import withAuthorizer from "../../../../middleware/withAuthorizer";
import { NextApiResponse } from "next";
import InputValidation from "../../../../utils/inputValidation";
import UpdateOpening from "../../../../utils/openings/updateOpening";
<<<<<<< HEAD
=======
import { DeleteOpening } from "../../../../utils/openings/deleteOpening";
>>>>>>> stage-reorder-patch
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
        org_id: user.org_id,
        opening_id: opening_id as string,
        updated_opening: body.updated_opening,
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
<<<<<<< HEAD
      const get_opening_input: GetOpeningInput = {
        org_id: user.org_id,
        opening_id: opening_id,
      };
      let opening = await GetOpening(get_opening_input);
      opening.stage_order = body.new_stage_order;

      const update_opening_input = {
        org_id: user.org_id,
        opening_id: opening_id,
        updated_opening: opening,
      };
      await UpdateOpening(update_opening_input);
      return res.status(200).json({ message: "Stage order updated!" });
=======
      const delete_opening_input = {
        org_id: user.org_id,
        opening_id: opening_id,
      };
      await DeleteOpening(delete_opening_input);
      return res.status(200).json({ message: "Opening deleted" });
>>>>>>> stage-reorder-patch
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Unable to delete your opening ${error}` });
    }
  }
<<<<<<< HEAD

  if (method === "PUT") {
    try {
      const update_opening_input: UpdateOpeningInput = {
        org_id: user.org_id,
        opening_id: opening_id as string,
        updated_opening: body.updated_opening,
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
=======
>>>>>>> stage-reorder-patch
  return res.status(405).json({ message: "Not Allowed" });
};

export default withAuthorizer(handler);
