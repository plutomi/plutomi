import { NextApiRequest, NextApiResponse } from "next";
import { JoinOrg } from "../../../../utils/users/joinOrg";
import InputValidation from "../../../../utils/inputValidation";
import withAuthorizer from "../../../../middleware/withAuthorizer";
import AcceptOrgInvite from "../../../../utils/users/acceptOrgInvite";
const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { method, query, user, body } = req;
  const { org_id } = query;

  const accept_org_invite: GetOrgInviteInput = {
    user_id: user.user_id,
    timestamp: body.timestamp,
    invite_id: body.invite_id,
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
    if (user.org_id != "NO_ORG_ASSIGNED") {
      return res
        .status(400)
        .json({ message: `You already belong to an org: ${user.org_id}` });
    }

    try {
      await AcceptOrgInvite(accept_org_invite);
      // TODO delete the accepted invite
      // TODO if user is already in org, delete invite
      // TODO add TTL to invite
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
