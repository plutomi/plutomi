import CreateOrgInvite from "../../../utils/invites/createOrgInvite";
import SendOrgInvite from "../../../utils/email/sendOrgInvite";
import InputValidation from "../../../utils/inputValidation";
import { getPastOrFutureTime } from "../../../utils/time";
import { NextApiResponse } from "next";
import withCleanOrgId from "../../../middleware/withCleanOrgId";
import { GetOrg } from "../../../utils/orgs/getOrg";
import withSession from "../../../middleware/withSession";
import { createUser } from "../../../utils/users/createUser";
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

  const { recipientEmail }: APICreateOrgInviteInput = body;

  const default_expiry_time = 3;
  const default_expiry_value = "days";
  const expiresAt = getPastOrFutureTime(
    "future",
    default_expiry_time,
    "days" || default_expiry_value,
    "iso"
  );

  const org = await GetOrg(user_session.orgId);

  const new_org_invite: CreateOrgInviteInput = {
    claimed: false,
    orgName: org.GSI1SK, // For the recipient they can see the name of the org instead of the orgId, much neater
    createdBy: user_session, // TODO reduce this to just name & email
    orgId: org.orgId,
    recipientEmail: recipientEmail,
    expiresAt: expiresAt,
  };
  if (method === "POST") {
    try {
      InputValidation(new_org_invite);
    } catch (error) {
      return res.status(400).json({ message: `${error.message}` });
    }

    if (user_session.userEmail == recipientEmail) {
      return res.status(400).json({ message: "You can't invite yourself" });
    }

    if (user_session.orgId === "NO_ORG_ASSIGNED") {
      return res.status(400).json({
        message: `You must create an organization before inviting users`,
      });
    }

    let recipient = await getUserByEmail(userEmail);

    if (!recipient) {
      recipient = await createUser(userEmail);
    }

    const recipient = await createUser(userEmail);

    const new_org_invite_email: SendOrgInviteInput = {
      createdBy: user_session,
      orgName: org.GSI1SK,
      recipientEmail: recipient.userEmail, // Will be lowercase & .trim()'d by createUser
    };
    try {
      await CreateOrgInvite({
        orgId: org.orgId,
        user: recipient,
        orgName: org.GSI1SK,
        expiresAt: expiresAt,
        createdBy: user_session,
      });
      try {
        await SendOrgInvite(new_org_invite_email); // TODO async with streams
        return res
          .status(201)
          .json({ message: `Invite sent to '${recipient.userEmail}'` });
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
