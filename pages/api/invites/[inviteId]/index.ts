import InputValidation from "../../../../utils/inputValidation";
import { NextApiRequest, NextApiResponse } from "next";
import deleteOrgInvite from "../../../../utils/invites/deleteOrgInvite";
import { getOrgInvite } from "../../../../utils/invites/getOrgInvite";
import { withSessionRoute } from "../../../../middleware/withSession";
import { getUserById } from "../../../../utils/users/getUserById";
import { joinOrgFromInvite } from "../../../../utils/orgs/joinOrgFromInvite";
import { API_METHODS, ENTITY_TYPES } from "../../../../defaults";
import withAuth from "../../../../middleware/withAuth";
import withValidMethod from "../../../../middleware/withValidMethod";
import { CUSTOM_QUERY } from "../../../../types/main";
import clean from "../../../../utils/clean";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { method, query } = req;
  const { inviteId } = query as Pick<CUSTOM_QUERY, "inviteId">;

  // TODO trycatch
  const invite = await getOrgInvite(req.session.user.userId, inviteId);
  const joinOrgInput = {
    userId: req.session.user.userId,
    invite: invite,
  };

  try {
    InputValidation(joinOrgInput);
  } catch (error) {
    console.error("Error accepting invite", error);
    return res.status(400).json({ message: `${error.message}` });
  }

  if (method === API_METHODS.POST) {
    // TODO disallow orgId's by this name
    if (req.session.user.orgId != PLACEHOLDERS.NO_ORG) {
      return res.status(400).json({
        message: `You already belong to an org: ${req.session.user.orgId}`,
      });
    }

    try {
      await joinOrgFromInvite({ userId: req.session.user.userId, invite });

      const updatedUser = await getUserById(req.session.user.userId);

      req.session.user = clean(updatedUser, ENTITY_TYPES.USER);
      await req.session.save();
      return res
        .status(200)
        .json({ message: `You've joined the ${invite.orgName} org!` });
    } catch (error) {
      return res
        .status(500) // TODO change #
        .json({
          message: `We were unable to  ${error}`,
        });
    }
  }

  if (method === API_METHODS.DELETE) {
    const deleteOrgInviteInput = {
      userId: req.session.user.userId,
      inviteId: inviteId,
    };

    try {
      InputValidation(deleteOrgInviteInput);
    } catch (error) {
      return res.status(400).json({ message: `${error.message}` });
    }

    try {
      await deleteOrgInvite(deleteOrgInviteInput);
      return res.status(200).json({ message: "Invite rejected!" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Unable to reject invite - ${error}` });
    }
  }
};

export default withValidMethod(withSessionRoute(withAuth(handler)), [
  API_METHODS.POST,
  API_METHODS.DELETE,
]);
