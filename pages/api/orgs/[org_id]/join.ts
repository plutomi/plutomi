import AcceptOrgInvite from "../../../../utils/invites/acceptOrgInvite";
import withAuthorizer from "../../../../middleware/withAuthorizer";
import InputValidation from "../../../../utils/inputValidation";
import { JoinOrg } from "../../../../utils/users/joinOrg";
import { NextApiResponse } from "next";

const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { method, query, body } = req;
  const user: DynamoUser = req.user;
  const { timestamp, invite_id }: APIAcceptOrgInvite = body;
  const { org_id } = query;

  const accept_org_invite: AcceptOrgInviteInput = {
    user_id: user.user_id,
    timestamp: timestamp,
    invite_id: invite_id,
  };

  // TODO not implemented yet
  const delete_org_invite: DeleteOrgInviteInput = {
    user_id: user.user_id,
    timestamp: timestamp,
    invite_id: invite_id,
  };
  const join_org_input: JoinOrgInput = {
    user_id: user.user_id,
    org_id: org_id as string,
  };

  try {
    InputValidation(accept_org_invite);
    InputValidation(join_org_input);
  } catch (error) {
    return res.status(400).json({ message: `${error.message}` });
  }

  if (method === "POST") {
    // While this isn't really an issue as far as I can tell
    // I am keeping it here just in case
    if (user.org_id != "NO_ORG_ASSIGNED") {
      return res
        .status(400)
        .json({ message: `You already belong to an org: ${user.org_id}` });
    }

    try {
      await AcceptOrgInvite(accept_org_invite);
      try {
        await JoinOrg(join_org_input);
        return res
          .status(200)
          .json({ message: `You've joined the ${org_id} org!` });
      } catch (error) {
        // TODO add error logger
        return res
          .status(500) // TODO change #
          .json({
            message: `The invite was accepted, but we were not able to add you to the org - ${error}`,
          });
      }
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Unable to accept invite - ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withAuthorizer(handler);
