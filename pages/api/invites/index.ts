import createOrgInvite from "../../../utils/invites/createOrgInvite";
import sendOrgInvite from "../../../utils/email/sendOrgInvite";
import InputValidation from "../../../utils/inputValidation";
import { NextApiRequest, NextApiResponse } from "next";
import Time from "../../../utils/time";
import { getOrg } from "../../../utils/orgs/getOrg";
import { withSessionRoute } from "../../../middleware/withSession";
import { createUser } from "../../../utils/users/createUser";
import { TIME_UNITS, API_METHODS } from "../../../defaults";
import withAuth from "../../../middleware/withAuth";
import withValidMethod from "../../../middleware/withValidMethod";
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

    if (req.session.user.orgId === "NO_ORG_ASSIGNED") {
      return res.status(400).json({
        message: `You must create an organization before inviting users`,
      });
    }

    // Creates the user
    const recipient = await createUser({ email: recipientEmail });

    const newOrgInviteEmail = {
      createdBy: req.session.user,
      orgName: org.GSI1SK,
      recipientEmail: recipient.email, // Will be lowercase & .trim()'d by createUser
    };
    try {
      await createOrgInvite({
        orgId: org.orgId,
        user: recipient,
        orgName: org.GSI1SK,
        expiresAt: expiresAt,
        createdBy: req.session.user,
      });
      try {
        await sendOrgInvite(newOrgInviteEmail); // TODO async with streams
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
