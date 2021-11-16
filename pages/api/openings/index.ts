import { getAllOpeningsInOrg } from "../../../utils/openings/getAllOpeningsInOrg";
import { createOpening } from "../../../utils/openings/createOpening";
import InputValidation from "../../../utils/inputValidation";
import { NextApiResponse } from "next";
import { withSessionRoute } from "../../../middleware/withSession";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const userSession = req.session.user;

  const { body, method } = req;
  const { GSI1SK }: APICreateOpeningInput = body;

  if (method === API_METHODS.POST) {
    if (userSession.orgId === "NO_ORG_ASSIGNED") {
      return res.status(403).json({
        message: "Please create an organization before creating an opening",
      });
    }
    try {
      const createOpeningInput: CreateOpeningInput = {
        orgId: userSession.orgId,
        GSI1SK: GSI1SK,
      };

      try {
        InputValidation(createOpeningInput);
      } catch (error) {
        return res
          .status(400)
          .json({ message: `An error occurred: ${error.message}` });
      }

      await createOpening(createOpeningInput);
      return res.status(201).json({ message: "Opening created!" });
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to create opening: ${error}` });
    }
  }

  if (method === API_METHODS.GET) {
    try {
      const allOpenings = await getAllOpeningsInOrg(userSession.orgId);
      return res.status(200).json(allOpenings);
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
