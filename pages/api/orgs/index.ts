import { NextApiRequest, NextApiResponse } from "next";
import withCleanOrgId from "../../../middleware/withCleanOrgId";
import InputValidation from "../../../utils/inputValidation";
import { getAllUserInvites } from "../../../utils/invites/getAllOrgInvites";
import { withSessionRoute } from "../../../middleware/withSession";
import cleanUser from "../../../utils/clean/cleanUser";
import { getUserById } from "../../../utils/users/getUserById";
import { createAndJoinOrg } from "../../../utils/orgs/createAndJoinOrg";
import { API_METHODS } from "../../../defaults";
import withAuth from "../../../middleware/withAuth";
import withValidMethod from "../../../middleware/withValidMethod";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { body, method } = req;
  const { GSI1SK, orgId } = body;

  // Create an org
  if (method === API_METHODS.POST) {
    if (GSI1SK === "NO_ORG_ASSIGNED") {
      // TODO major, this isn't using the withCleanOrgId
      return res.status(400).json({
        message: `You cannot create an org with this name: ${GSI1SK}`,
      });
    }
    if (req.session.user.orgId != "NO_ORG_ASSIGNED") {
      return res.status(400).json({
        message: `You already belong to an org!`,
      });
    }

    const pendingInvites = await getAllUserInvites(req.session.user.userId);

    if (pendingInvites && pendingInvites.length > 0) {
      return res.status(403).json({
        message:
          "You seem to have pending invites, please accept or reject them before creating an org :)",
      });
    }

    const createOrgInput = {
      GSI1SK: GSI1SK,
      orgId: orgId,
      user: req.session.user,
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
      await createAndJoinOrg({
        userId: req.session.user.userId,
        orgId: orgId,
        GSI1SK: GSI1SK,
      });
      const updatedUser = await getUserById(req.session.user.userId); // TODO remove this, wait for transact

      // Update the logged in user session with the new org id
      req.session.user = cleanUser(updatedUser);
      await req.session.save();

      return res.status(201).json({ message: "Org created!", org: orgId });
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `${error}` });
    }
  }
};

export default withCleanOrgId(
  withValidMethod(withSessionRoute(withAuth(handler)), [API_METHODS.POST])
);
