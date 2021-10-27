import { NextApiResponse } from "next";
import withCleanOrgId from "../../../middleware/withCleanOrgId";
import InputValidation from "../../../utils/inputValidation";
import { GetAllUserInvites } from "../../../utils/invites/getAllOrgInvites";
import withSession from "../../../middleware/withSession";
import CleanUser from "../../../utils/clean/cleanUser";
import { GetUserById } from "../../../utils/users/getUserById";
import { CreateAndJoinOrg } from "../../../utils/orgs/createAndJoinOrg";

const handler = async (
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> => {
  const user_session = req.session.get("user");
  if (!user_session) {
    req.session.destroy();
    return res.status(401).json({ message: "Please sign in again" });
  }
  const { body, method } = req;
  const { GSI1SK, org_id }: APICreateOrgInput = body;

  // Create an org
  if (method === "POST") {
    if (GSI1SK === "NO_ORG_ASSIGNED") {
      // TODO major, this isn't using the withCleanOrgId
      return res.status(400).json({
        message: `You cannot create an org with this name: ${GSI1SK}`,
      });
    }
    if (user_session.org_id != "NO_ORG_ASSIGNED") {
      return res.status(400).json({
        message: `You already belong to an org!`,
      });
    }

    const pending_invites = await GetAllUserInvites(user_session.user_id);

    if (pending_invites && pending_invites.length > 0) {
      return res.status(403).json({
        message:
          "You seem to have pending invites, please accept or reject them before creating an org :)",
      });
    }

    const create_org_input: CreateOrgInput = {
      GSI1SK: GSI1SK,
      org_id: org_id,
      user: user_session,
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
      const response = await CreateAndJoinOrg({
        user_id: user_session.user_id,
        org_id: org_id,
        GSI1SK: GSI1SK,
      });
      console.log("Response!", response);
      const updated_user = await GetUserById(user_session.user_id); // TODO remove this, wait for transact

      // Update the logged in user session with the new org id
      req.session.set("user", CleanUser(updated_user as DynamoUser));
      await req.session.save();

      return res.status(201).json({ message: "Org created!", org: org_id });
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withSession(withCleanOrgId(handler));
