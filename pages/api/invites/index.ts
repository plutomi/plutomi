import createOrgInvite from "../../../utils/invites/createOrgInvite";
import InputValidation from "../../../utils/inputValidation";
import { NextApiRequest, NextApiResponse } from "next";
import Time from "../../../utils/time";
import { getOrg } from "../../../utils/orgs/getOrg";
import { withSessionRoute } from "../../../middleware/withSession";
import { createUser } from "../../../utils/users/createUser";
import {
  TIME_UNITS,
  API_METHODS,
  EMAILS,
  PLACEHOLDERS,
} from "../../../defaults";
import withAuth from "../../../middleware/withAuth";
import withValidMethod from "../../../middleware/withValidMethod";
import sendEmail from "../../../utils/sendEmail";
const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { body, method } = req;

  const { recipientEmail } = body;

  const expiresAt = Time.futureISO(3, TIME_UNITS.DAYS);

  const org = await getOrg(req.session.user.orgId);

  const newOrgInvite = {
    claimed: false,
    orgName: org.GSI1SK, // For the recipient they can see the name of the org instead of the orgId, much neater
    createdBy: req.session.user, // TODO reduce this to just name & email
    orgId: org.orgId,
    recipientEmail: recipientEmail,
    expiresAt: expiresAt,
  };
  if (method === API_METHODS.POST) {
    try {
      InputValidation(newOrgInvite);
    } catch (error) {
      return res.status(400).json({ message: `${error.message}` });
    }

    if (req.session.user.email == recipientEmail) {
      return res.status(400).json({ message: "You can't invite yourself" });
    }

    if (req.session.user.orgId === PLACEHOLDERS.NO_ORG) {
      return res.status(400).json({
        message: `You must create an organization before inviting users`,
      });
    }

    // Creates the user
    const recipient = await createUser({ email: recipientEmail });

    try {
      await createOrgInvite({
        orgId: org.orgId,
        recipient: recipient,
        orgName: org.GSI1SK,
        expiresAt: expiresAt,
        createdBy: req.session,
      });
      try {
        await sendEmail({
          fromName: "Plutomi",
          fromAddress: EMAILS.GENERAL,
          toAddresses: [recipient.email],
          subject: `${req.session.user.firstName} ${req.session.user.lastName} has invited you to join ${org.GSI1SK} on Plutomi!`,
          html: `<h4>You can log in at <a href="${process.env.NEXT_PUBLIC_WEBSITE_URL}">${process.env.NEXT_PUBLIC_WEBSITE_URL}</a> to accept it!</h4><p>If you believe this email was received in error, you can safely ignore it.</p>`,
        });
        return res
          .status(201)
          .json({ message: `Invite sent to '${recipient.email}'` });
      } catch (error) {
        return res.status(500).json({
          message: `The invite was created, but we were not able to send an email to the user. They log in and accept their invite at https://plutomi.com/invites - ${error}`,
        });
      }
    } catch (error) {
      return res.status(500).json({ message: `${error}` });
    }
  }
};

export default withValidMethod(withSessionRoute(withAuth(handler)), [
  API_METHODS.POST,
]);
