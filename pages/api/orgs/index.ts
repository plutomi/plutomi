import { NextApiResponse } from "next";
import withCleanOrgId from "../../../middleware/withCleanOrgId";
import InputValidation from "../../../utils/inputValidation";
import { GetAllUserInvites } from "../../../utils/invites/getAllOrgInvites";
import { withSessionRoute } from "../../../middleware/withSession";
import CleanUser from "../../../utils/clean/cleanUser";
import { GetUserById } from "../../../utils/users/getUserById";
import { CreateAndJoinOrg } from "../../../utils/orgs/createAndJoinOrg";

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
  const { GSI1SK, orgId }: APICreateOrgInput = body;

  // Create an org
  if (method === "POST") {
    if (GSI1SK === "NO_ORG_ASSIGNED") {
      // TODO major, this isn't using the withCleanOrgId
      return res.status(400).json({
        message: `You cannot create an org with this name: ${GSI1SK}`,
      });
    }
    if (userSession.orgId != "NO_ORG_ASSIGNED") {
      return res.status(400).json({
        message: `You already belong to an org!`,
      });
    }

    const pendingInvites = await GetAllUserInvites(userSession.userId);

    if (pendingInvites && pendingInvites.length > 0) {
      return res.status(403).json({
        message:
          "You seem to have pending invites, please accept or reject them before creating an org :)",
      });
    }

    const createOrgInput: CreateOrgInput = {
      GSI1SK: GSI1SK,
      orgId: orgId,
      user: userSession,
    };

    try {
      InputValidation(createOrgInput);
    } catch (error) {
      return res.status(400).json({ message: `${error.message}` });
    }

    // TODO add joi
    if (GSI1SK.length == 0) {
      return res.status(400).json({ message: "Org name cannot be empty" });
    }

    try {
      await CreateAndJoinOrg({
        userId: userSession.userId,
        orgId: orgId,
        GSI1SK: GSI1SK,
      });
      const updatedUser = await GetUserById(userSession.userId); // TODO remove this, wait for transact

      // Update the logged in user session with the new org id
      req.session.user = CleanUser(updatedUser);
      await req.session.save();

      return res.status(201).json({ message: "Org created!", org: orgId });
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withSessionRoute(withCleanOrgId(handler));
