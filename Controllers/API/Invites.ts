import { Request, Response } from "express";
import Joi from "joi";
import { API_METHODS, DEFAULTS, EMAILS, TIME_UNITS } from "../../Config";
import createOrgInvite from "../../utils/invites/createOrgInvite";
import deleteOrgInvite from "../../utils/invites/deleteOrgInvite";
import { getOrg } from "../../utils/orgs/getOrg";
import sendEmail from "../../utils/sendEmail";
import * as Time from "../../utils/time";
import { createUser } from "../../utils/users/createUser";
import { getUserByEmail } from "../../utils/users/getUserByEmail";

export const create = async (req: Request, res: Response) => {
  const { body, method } = req;
  const { recipientEmail } = body; // todo trim and lowercase this email
  const expiresAt = Time.futureISO(3, TIME_UNITS.DAYS);
  const [org, error] = await getOrg({ orgId: req.session.user.orgId });

  if (error) {
    console.error("error creating invite", error);
    return res
      .status(500)
      .json({ message: "An error ocurred creating your invite" });
  }

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
        orgId: org.orgId, // TODO should be fixed with return type above
        recipient: recipient,
        orgName: org.GSI1SK,
        expiresAt: expiresAt,
        createdBy: req.session.user,
      });
      try {
        await sendEmail({
          // TODO async decouple this
          fromName: org.GSI1SK, // TODO should be fixed with return type above
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

export const reject = async (req: Request, res: Response) => {
  const { inviteId } = req.params;
  try {
    await deleteOrgInvite({
      inviteId: inviteId,
      userId: req.session.user.userId,
    });
    req.session.user.totalInvites -= 1;
    await req.session.save();
    return res.status(200).json({ message: "Invite rejected!" }); // TODO enum for RESPONSES
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Unable to reject invite - ${error}` });
  }
};
