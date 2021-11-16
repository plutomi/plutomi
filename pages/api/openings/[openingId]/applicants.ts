import { NextApiRequest, NextApiResponse } from "next";
import { getAllApplicantsInOpening } from "../../../../utils/openings/getAllApplicantsInOpening";
import { withSessionRoute } from "../../../../middleware/withSession";
import InputValidation from "../../../../utils/inputValidation";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const userSession = req.session.user;

  const { method, query } = req;
  const { openingId } = query as Pick<CUSTOM_QUERY, "openingId">;

  if (method === "GET") {
    const getAllApplicantsInOpeningInput = {
      orgId: userSession.orgId,
      openingId: openingId,
    };

    try {
      InputValidation(getAllApplicantsInOpeningInput);
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

  return res.status(405).json({ message: "Not Allowed" });
};

export default withSessionRoute(handler);
