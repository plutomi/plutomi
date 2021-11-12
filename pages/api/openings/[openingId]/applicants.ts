import { NextApiResponse } from "next";
import { GetAllApplicantsInOpening } from "../../../../utils/openings/getAllApplicantsInOpening";
import { withSessionRoute } from "../../../../middleware/withSession";
import InputValidation from "../../../../utils/inputValidation";

const handler = async (
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> => {
  const userSession = req.session.user;
  if (!userSession) {
    req.session.destroy();
    return res.status(401).json({ message: "Please log in again" });
  }
  const { method, query } = req;
  const { openingId } = query as CustomQuery;

  if (method === "GET") {
    const get_all_applicants_in_opening_input = {
      orgId: userSession.orgId,
      openingId: openingId,
    };

    try {
      InputValidation(get_all_applicants_in_opening_input);
    } catch (error) {
      return res.status(400).json({ message: `${error.message}` });
    }

    try {
      const all_applicants = await GetAllApplicantsInOpening(
        get_all_applicants_in_opening_input
      );
      return res.status(200).json(all_applicants);
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
