import { NextApiRequest, NextApiResponse } from "next";
import { getAllApplicantsInOpening } from "../../../../utils/openings/getAllApplicantsInOpening";
import { withSessionRoute } from "../../../../middleware/withSession";
import { API_METHODS } from "../../../../Config";
import withAuth from "../../../../middleware/withAuth";
import withValidMethod from "../../../../middleware/withValidMethod";
import { CUSTOM_QUERY } from "../../../../types/main";
import Joi from "joi";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { method, query } = req;
  const { openingId } = query as Pick<CUSTOM_QUERY, "openingId">;

  if (method === API_METHODS.GET) {
    const getAllApplicantsInOpeningInput = {
      orgId: req.session.user.orgId,
      openingId: openingId,
    };

    const schema = Joi.object({
      orgId: Joi.string(),
      openingId: Joi.string(),
    }).options({ presence: "required" });

    // Validate input
    try {
      await schema.validateAsync(getAllApplicantsInOpeningInput);
    } catch (error) {
      return res.status(400).json({ message: `${error.message}` });
    }

    try {
      const allApplicants = await getAllApplicantsInOpening(
        getAllApplicantsInOpeningInput
      );
      return res.status(200).json(allApplicants);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to retrieve applicants: ${error}` });
    }
  }
};

export default withValidMethod(withSessionRoute(withAuth(handler)), [
  API_METHODS.GET,
]);
