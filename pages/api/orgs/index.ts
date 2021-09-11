import { NextApiRequest, NextApiResponse } from "next";
import { CreateOrg } from "../../../utils/orgs/createOrg";
import { GetOrg } from "../../../utils/orgs/getOrg";
import withCleanOrgName from "../../../middleware/withCleanOrgName";
import InputValidation from "../../../utils/inputValidation";
import withAuthorizer from "../../../middleware/withAuthorizer";
import { JoinOrg } from "../../../utils/users/joinOrg";
const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { body, method, user } = req;
  const { org_name, org_id } = body;
  // Create an org
  if (method === "POST") {
    if (user.org_id != "NO_ORG_ASSIGNED") {
      return res
        .status(400)
        .json({
          message: `You already belong to an org. Deleting an org is not available at this time`,
        });
    }

    const create_org_input: CreateOrgInput = {
      org_name: org_name,
      org_id: org_id,
      user: user,
    };

    try {
      InputValidation(create_org_input);
    } catch (error) {
      return res.status(400).json({ message: `${error.message}` });
    }
    try {
      const org = await CreateOrg(create_org_input);

      try {
        const join_org_input: JoinOrgInput = {
          user_id: user.user_id,
          org_id: org_id,
        };
        await JoinOrg(join_org_input);
        return res.status(201).json({ message: "Org created!", org: org });
      } catch (error) {
        // TODO retry this
        return res.status(500).json({
          message:
            "We were able to create your org, however you were not able to join it",
        });
      }
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withAuthorizer(withCleanOrgName(handler));
