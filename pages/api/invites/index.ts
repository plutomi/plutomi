import createOrgInvite from "../../../utils/invites/createOrgInvite";
import { NextApiRequest, NextApiResponse } from "next";
import Time from "../../../utils/time";
import { getOrg } from "../../../utils/orgs/getOrg";
import { withSessionRoute } from "../../../middleware/withSession";
import { createUser } from "../../../utils/users/createUser";
import { TIME_UNITS, API_METHODS, EMAILS, DEFAULTS } from "../../../Config";
import withAuth from "../../../middleware/withAuth";
import withValidMethod from "../../../middleware/withValidMethod";
import sendEmail from "../../../utils/sendEmail";
import Joi from "joi";
import { getUserByEmail } from "../../../utils/users/getUserByEmail";
const UrlSafeString = require("url-safe-string"),
  tagGenerator = new UrlSafeString();

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { body, method } = req;
  const { recipientEmail } = body; // todo trim and lowercase this email
  const expiresAt = Time.futureISO(3, TIME_UNITS.DAYS);
  const org = await getOrg({ orgId: req.session.user.orgId }); // TODO fix this type

  if (method === API_METHODS.POST) {
    // TODO add types
    const schema = Joi.object({
      recipientEmail: Joi.string().email().messages({
        "string.base": `"recipientEmail" must be a string`,
        "string.email": `"recipientEmail" must be a valid email`,
      }),
    }).options({ presence: "required" });

    try {
      await schema.validateAsync(body);
    } catch (error) {
      return res.status(400).json({ message: `${error.message}` });
    }

    if (req.session.user.email == recipientEmail) {
      return res.status(400).json({ message: "You can't invite yourself" }); // TODO errors enum
    }

    if (req.session.user.orgId === DEFAULTS.NO_ORG) {
      return res.status(400).json({
        message: `You must create an organization before inviting users`, // TODO errors enum
      });
    }

    let recipient = await getUserByEmail({ email: recipientEmail });

    if (!recipient) {
      recipient = await createUser({ email: recipientEmail });
    }

    try {
      await createOrgInvite({
        orgId: org.orgId,
        recipient: recipient,
        orgName: org.GSI1SK,
        expiresAt: expiresAt,
        createdBy: req.session.user,
      });
      try {
        await sendEmail({
          fromName: org.GSI1SK,
          fromAddress: EMAILS.GENERAL,
          toAddresses: [recipient.email],
          subject: `${req.session.user.firstName} ${req.session.user.lastName} has invited you to join them on Plutomi!`,
          html: `<h4>You can log in at <a href="${process.env.NEXT_PUBLIC_WEBSITE_URL} target=_blank rel=noreferrer">${process.env.NEXT_PUBLIC_WEBSITE_URL}</a> to accept it!</h4><p>If you believe this email was received in error, you can safely ignore it.</p>`,
        }); // TODO add target=_blank and rel=noreferrer ^
        return res
          .status(201)
          .json({ message: `Invite sent to '${recipient.email}'` });
      } catch (error) {
        return res.status(500).json({
          // TODO update this since email will be done with streams
          message: `The invite was created, but we were not able to send an email to the user. They can log in and accept their invite at https://plutomi.com/invites - ${error}`,
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
