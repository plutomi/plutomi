import { GetAllOpeningsInOrg } from "../../../utils/openings/getAllOpeningsInOrg";
import { CreateOpening } from "../../../utils/openings/createOpening";
import withAuthorizer from "../../../middleware/withAuthorizer";
import InputValidation from "../../../utils/inputValidation";
import { NextApiResponse } from "next";

const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { body, method } = req;
  const user: DynamoUser = req.user;
  const { GSI1SK, is_public }: APICreateOpeningInput = body;

  if (method === "POST") {
    if (user.org_id === "NO_ORG_ASSIGNED") {
      return res.status(403).json({
        message: "Please create an organization before creating an opening",
      });
    }
    try {
      const create_opening_input: CreateOpeningInput = {
        org_id: user.org_id,
        GSI1SK: GSI1SK,
        is_public: is_public,
      };

      try {
        InputValidation(create_opening_input);
      } catch (error) {
        return res.status(400).json({ message: `${error.message}` });
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
    console.log("USER", user);

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
};

export default withAuthorizer(handler);
