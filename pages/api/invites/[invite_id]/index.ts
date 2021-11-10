import AcceptOrgInvite from "../../../../utils/invites/acceptOrgInvite";
import InputValidation from "../../../../utils/inputValidation";
import { NextApiResponse } from "next";
import DeleteOrgInvite from "../../../../utils/invites/deleteOrgInvite";
import withCleanOrgId from "../../../../middleware/withCleanOrgId";
import { GetOrgInvite } from "../../../../utils/invites/getOrgInvite";
import withSession from "../../../../middleware/withSession";
import CleanUser from "../../../../utils/clean/cleanUser";
import { GetUserById } from "../../../../utils/users/getUserById";
import { JoinOrgFromInvite } from "../../../../utils/orgs/joinOrgFromInvite";

const handler = async (
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> => {
  const user_session = req.session.get("user");
  if (!user_session) {
    req.session.destroy();
    return res.status(401).json({ message: "Please log in again" });
  }
  const { method, query } = req;
  const { invite_id } = query as CustomQuery;

  // TODO trycatch
  const invite = await GetOrgInvite({
    userId: user_session.userId,
    invite_id: invite_id,
  });

  const join_org_input = {
    userId: user_session.userId,
    invite: invite,
  };

  try {
    InputValidation(join_org_input);
  } catch (error) {
    return res.status(400).json({ message: `${error.message}` });
  }

  if (method === "POST") {
    // TODO disallow orgId's by this name
    if (user_session.orgId != "NO_ORG_ASSIGNED") {
      return res.status(400).json({
        message: `You already belong to an org: ${user_session.orgId}`,
      });
    }

    try {
      await JoinOrgFromInvite({ userId: user_session.userId, invite });

      const updated_user = await GetUserById(user_session.userId);
      req.session.set("user", CleanUser(updated_user as DynamoUser));
      await req.session.save();
      return res
        .status(200)
        .json({ message: `You've joined the ${invite.org_name} org!` });
    } catch (error) {
      return res
        .status(500) // TODO change #
        .json({
          message: `We were unable to  ${error}`,
        });
    }
  }

  if (method === "DELETE") {
    const delete_org_invite_input = {
      userId: user_session.userId,
      invite_id: invite_id,
    };

    try {
      InputValidation(delete_org_invite_input);
    } catch (error) {
      return res.status(400).json({ message: `${error.message}` });
    }

    try {
      await DeleteOrgInvite(delete_org_invite_input);
      return res.status(200).json({ message: "Invite rejected!" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Unable to reject invite - ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withSession(withCleanOrgId(handler));
