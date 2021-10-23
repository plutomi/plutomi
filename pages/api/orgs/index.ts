import { NextApiResponse } from "next";
import { CreateOrg } from "../../../utils/orgs/createOrg";
import withCleanOrgName from "../../../middleware/withCleanOrgName";
import InputValidation from "../../../utils/inputValidation";
import { JoinOrg } from "../../../utils/users/joinOrg";
import { GetAllUserInvites } from "../../../utils/invites/getAllOrgInvites";
import withSession from "../../../middleware/withSession";

async function handler(
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> {
  const user = req.session.get("user");
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> dd45c08 (replaced next-auth with next-iron-session)
  if (!user) {
    req.session.destroy();
    return res.status(401).json({ message: "Please sign in again" });
  }
<<<<<<< HEAD
=======
>>>>>>> 12d77e0 (Replaced withauthorizer with withSession)
=======
>>>>>>> dd45c08 (replaced next-auth with next-iron-session)
  const { body, method } = req;
  const { GSI1SK, org_id }: APICreateOrgInput = body;

  // Create an org
  if (method === "POST") {
    if (GSI1SK === "NO_ORG_ASSIGNED") {
      return res.status(400).json({
        message: `You cannot create an org with this name: ${GSI1SK}`,
      });
    }
    if (user.org_id != "NO_ORG_ASSIGNED") {
      return res.status(400).json({
        message: `You already belong to an org!`,
      });
    }

    const pending_invites = await GetAllUserInvites(user.user_id);

    if (pending_invites && pending_invites.length > 0) {
      return res.status(403).json({
        message:
          "You seem to have pending invites, please accept or reject them before creating an org :)",
      });
    }

    const create_org_input: CreateOrgInput = {
      GSI1SK: GSI1SK,
      org_id: org_id,
      user: user,
    };

    try {
      InputValidation(create_org_input);
    } catch (error) {
      return res.status(400).json({ message: `${error.message}` });
    }

    // TODO add joi
    if (GSI1SK.length == 0) {
      return res.status(400).json({ message: "Org name cannot be empty" });
    }
    try {
      // TODO promise all create and join
      const org = await CreateOrg(create_org_input);

      try {
        const join_org_input: JoinOrgInput = {
          user_id: user.user_id,
          org_id: org_id,
        };
        console.log("Join or ginput", join_org_input);

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
}

export default withSession(withCleanOrgName(handler));
