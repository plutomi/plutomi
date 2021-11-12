import { GetAllOpeningsInOrg } from "../../../utils/openings/getAllOpeningsInOrg";
import { CreateOpening } from "../../../utils/openings/createOpening";
import InputValidation from "../../../utils/inputValidation";
import { NextApiResponse } from "next";
import { withSessionRoute } from "../../../middleware/withSession";

const handler = async (
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> => {
  const userSession = req.session.user;
  if (!userSession) {
    req.session.destroy();
    return res.status(401).json({ message: "Please log in again" });
  }
  const { body, method } = req;
  const { GSI1SK }: APICreateOpeningInput = body;

  if (method === "POST") {
    if (userSession.orgId === "NO_ORG_ASSIGNED") {
      return res.status(403).json({
        message: "Please create an organization before creating an opening",
      });
    }
    try {
      const create_opening_input: CreateOpeningInput = {
        orgId: userSession.orgId,
        GSI1SK: GSI1SK,
      };

      try {
        InputValidation(create_opening_input);
      } catch (error) {
        return res
          .status(400)
          .json({ message: `An error occurred: ${error.message}` });
      }

      await CreateOpening(create_opening_input);
      return res.status(201).json({ message: "Opening created!" });
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to create opening: ${error}` });
    }
  }

  if (method === "GET") {
    try {
      const all_openings = await GetAllOpeningsInOrg(userSession.orgId);
      return res.status(200).json(all_openings);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to retrieve openings: ${error}` });
    }
  }
  return res.status(405).json({ message: "Not Allowed" });
};

export default withSessionRoute(handler);
