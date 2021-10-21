import AcceptOrgInvite from "../../../../utils/invites/acceptOrgInvite";
import withAuthorizer from "../../../../middleware/withAuthorizer";
import InputValidation from "../../../../utils/inputValidation";
import { JoinOrg } from "../../../../utils/users/joinOrg";
import { NextApiResponse } from "next";
import DeleteOrgInvite from "../../../../utils/invites/deleteOrgInvite";
import withCleanOrgName from "../../../../middleware/withCleanOrgName";
const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { method, query } = req;
  const user: DynamoUser = req.user;
  const { invite_id } = query;

  const accept_org_invite = {
    user_id: user.user_id,
    invite_id: invite_id as string,
  };

  const join_org_input: JoinOrgInput = {
    user_id: user.user_id,
    org_id: user?.org_id,
  };

  try {
    InputValidation(accept_org_invite);
    InputValidation(join_org_input);
  } catch (error) {
    return res.status(400).json({ message: `${error.message}` });
  }

  if (method === "POST") {
    // TODO disallow org_id's by this name
    if (user.org_id != "NO_ORG_ASSIGNED") {
      return res
        .status(400)
        .json({ message: `You already belong to an org: ${user.org_id}` });
    }

    try {
      // TODO promise all
      await AcceptOrgInvite(accept_org_invite);
      try {
        const org = await JoinOrg(join_org_input);
        return res
          .status(200)
          .json({ message: `You've joined the ${org.GSI1SK} org!` });
      } catch (error) {
        // TODO add error logger
        return res
          .status(500) // TODO change #
          .json({
            message: `The invite was accepted, but we were not able to add you to the org - ${error}`,
          });
      }
    } catch (error) {
      return res.status(500).json({ message: ` ${error}` });
    }
  }

  if (method === "DELETE") {
    const delete_org_invite = {
      user_id: user.user_id,
      invite_id: invite_id as string,
    };

    try {
      InputValidation(delete_org_invite);
    } catch (error) {
      return res.status(400).json({ message: `${error.message}` });
    }

    try {
      await DeleteOrgInvite(delete_org_invite);
      return res.status(200).json({ message: "Invite rejected!" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Unable to reject invite - ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withAuthorizer(withCleanOrgName(handler));
