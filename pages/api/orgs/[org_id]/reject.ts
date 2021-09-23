import DeleteOrgInvite from "../../../../utils/invites/deleteOrgInvite";
import withAuthorizer from "../../../../middleware/withAuthorizer";
import InputValidation from "../../../../utils/inputValidation";
import { NextApiResponse } from "next";

const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { method, query, user, body } = req;
  const { org_id } = query;

  const delete_org_invite: DeleteOrgInviteInput = {
    user_id: user.user_id,
    timestamp: body.timestamp,
    invite_id: body.invite_id,
  };

  try {
    InputValidation(delete_org_invite);
  } catch (error) {
    return res.status(400).json({ message: `${error.message}` });
  }

  if (method === "POST") {
    try {
      await DeleteOrgInvite(delete_org_invite);
      return res.status(200).json({ message: "Invite deleted!" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Unable to reject invite - ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withAuthorizer(handler);
