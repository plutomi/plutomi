import { NextApiResponse } from "next";
import { GetPastOrFutureTime, GetRelativeTime } from "../../../../utils/time";
import InputValidation from "../../../../utils/inputValidation";
import CreateOrgInvite from "../../../../utils/users/createOrgInvite";
import SendOrgInvite from "../../../../utils/email/sendOrgInvite";
import withAuthorizer from "../../../../middleware/withAuthorizer";
const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { body, method, user } = req;
  const { recipient, expiry_time_days } = body;

  const default_expiry_time = 3;
  const default_expiry_value = "days";
  const expires_at = GetPastOrFutureTime(
    "future",
    expiry_time_days || default_expiry_time,
    "days" || default_expiry_value, // TODO add days input
    "iso"
  );

  console.log("In api call", user);
  const new_org_invite: CreateOrgInviteInput = {
    claimed: false,
    invited_by: user,
    org_id: user.org_id,
    recipient: recipient,
    expires_at: expires_at as string,
  };
  if (method === "POST") {
    try {
      InputValidation(new_org_invite);
    } catch (error) {
      return res.status(400).json({ message: `${error.message}` });
    }

    const new_org_invite_email: SendOrgInviteInput = {
      invited_by: user,
      org_id: user.org_id,
      recipient: recipient,
    };
    try {
      await CreateOrgInvite(new_org_invite);
      try {
        await SendOrgInvite(new_org_invite_email);
        return res.status(201).json({ message: `Your user has been invited!` });
      } catch (error) {
        return res.status(500).json({
          message: `The invite was created, but we were not able to send an email to the user. They can accept their invite at https://plutomi.com/${user.org_id}/join - ${error}`,
        });
      }
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Unable to create invite - ${error}` });
    }
  }
  return res.status(405).json({ message: "Not Allowed" });
};

export default withAuthorizer(handler);
