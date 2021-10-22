import CreateOrgInvite from "../../../utils/invites/createOrgInvite";
import SendOrgInvite from "../../../utils/email/sendOrgInvite";
import InputValidation from "../../../utils/inputValidation";
import { GetPastOrFutureTime } from "../../../utils/time";
import { NextApiResponse } from "next";
import withCleanOrgName from "../../../middleware/withCleanOrgName";
import { GetOrg } from "../../../utils/orgs/getOrg";
import withSession from "../../../middleware/withSession";

<<<<<<< HEAD
=======
import withSession from "../../../middleware/withSession";

>>>>>>> 12d77e0 (Replaced withauthorizer with withSession)
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

  const { recipient_email }: APICreateOrgInviteInput = body;

  const default_expiry_time = 3;
  const default_expiry_value = "days";
  const expires_at = GetPastOrFutureTime(
    "future",
    default_expiry_time,
    "days" || default_expiry_value,
    "iso"
  );

  const org = await GetOrg(user.org_id);

  const new_org_invite: CreateOrgInviteInput = {
    claimed: false,
    org_name: org.GSI1SK, // For the client they can see the name instead of ID
    created_by: user, // TODO reduce this to just name & email
    org_id: user.org_id,
    recipient_email: recipient_email,
    expires_at: expires_at,
  };
  if (method === "POST") {
    try {
      InputValidation(new_org_invite);
    } catch (error) {
      return res.status(400).json({ message: `${error.message}` });
    }

    if (user.user_email == recipient_email) {
      return res.status(400).json({ message: "You can't invite yourself" });
    }

    if (user.org_id === "NO_ORG_ASSIGNED") {
      return res.status(400).json({
        message: `You must create an organization before inviting users`,
      });
    }

    const new_org_invite_email: SendOrgInviteInput = {
      created_by: user,
      org_name: org.GSI1SK,
      recipient_email: recipient_email,
    };
    try {
      await CreateOrgInvite(new_org_invite);
      try {
        await SendOrgInvite(new_org_invite_email);
        return res
          .status(201)
          .json({ message: `Invite sent to '${recipient_email}'` });
      } catch (error) {
        return res.status(500).json({
          message: `The invite was created, but we were not able to send an email to the user. They log in and accept their invite at https://plutomi.com/invites - ${error}`,
        });
      }
    } catch (error) {
      return res.status(500).json({ message: `${error}` });
    }
  }
  return res.status(405).json({ message: "Not Allowed" });
}

export default withSession(withCleanOrgName(handler));
