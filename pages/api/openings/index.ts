import { GetAllOpeningsInOrg } from "../../../utils/openings/getAllOpeningsInOrg";
import { CreateOpening } from "../../../utils/openings/createOpening";
import InputValidation from "../../../utils/inputValidation";
import { NextApiResponse } from "next";
import withSession from "../../../middleware/withSession";

async function handler(
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> {
  const user = req.session.get("user");
  if (!user) {
    req.session.destroy();
    return res.status(401).json({ message: "Please sign in again" });
  }
  const { body, method } = req;
  const { GSI1SK }: APICreateOpeningInput = body;

  if (method === "POST") {
    console.log("In post");
    if (user.org_id === "NO_ORG_ASSIGNED") {
      console.log("no org");

      return res.status(403).json({
        message: "Please create an organization before creating an opening",
      });
    }
    try {
      const create_opening_input: CreateOpeningInput = {
        org_id: user.org_id,
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
      const all_openings = await GetAllOpeningsInOrg(user.org_id);
      return res.status(200).json(all_openings);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to retrieve openings: ${error}` });
    }
  }
  return res.status(405).json({ message: "Not Allowed" });
}

export default withSession(handler);
