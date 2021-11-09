import CreateOrgInvite from "../../../utils/invites/createOrgInvite";
import SendOrgInvite from "../../../utils/email/sendOrgInvite";
import InputValidation from "../../../utils/inputValidation";
import { GetPastOrFutureTime } from "../../../utils/time";
import { NextApiResponse } from "next";
import withCleanOrgId from "../../../middleware/withCleanOrgId";
import { GetOrg } from "../../../utils/orgs/getOrg";
import withSession from "../../../middleware/withSession";
import { CreateUser } from "../../../utils/users/createUser";
const handler = async (
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> => {
  const user_session = req.session.get("user");
  if (!user_session) {
    req.session.destroy();
    return res.status(401).json({ message: "Please log in again" });
  }
  const { body, method } = req;

  const { recipient_email }: APICreateOrgInviteInput = body;

  const default_expiry_time = 3;
  const default_expiry_value = "days";
  const expiresAt = GetPastOrFutureTime(
    "future",
    default_expiry_time,
    "days" || default_expiry_value,
    "iso"
  );

  const org = await GetOrg(user_session.org_id);

  const new_org_invite: CreateOrgInviteInput = {
    claimed: false,
    org_name: org.GSI1SK, // For the recipient they can see the name of the org instead of the org_id, much neater
    created_by: user_session, // TODO reduce this to just name & email
    org_id: org.org_id,
    recipient_email: recipient_email,
    expiresAt: expiresAt,
  };
  if (method === "POST") {
    try {
      InputValidation(new_org_invite);
    } catch (error) {
      return res.status(400).json({ message: `${error.message}` });
    }

    if (user_session.user_email == recipient_email) {
      return res.status(400).json({ message: "You can't invite yourself" });
    }

    if (user_session.org_id === "NO_ORG_ASSIGNED") {
      return res.status(400).json({
        message: `You must create an organization before inviting users`,
      });
    }

    // Creates the user
    const recipient = await CreateUser({ user_email: recipient_email });

    const new_org_invite_email: SendOrgInviteInput = {
      created_by: user_session,
      org_name: org.GSI1SK,
      recipient_email: recipient.user_email, // Will be lowercase & .trim()'d by createUser
    };
    try {
      await CreateOrgInvite({
        org_id: org.org_id,
        user: recipient,
        org_name: org.GSI1SK,
        expiresAt: expiresAt,
        created_by: user_session,
      });
      try {
        await SendOrgInvite(new_org_invite_email); // TODO async with streams
        return res
          .status(201)
          .json({ message: `Invite sent to '${recipient.user_email}'` });
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
};

export default withSession(withCleanOrgId(handler));
