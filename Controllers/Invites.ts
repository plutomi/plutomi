import { Request, Response } from "express";
import Joi from "joi";
import { DEFAULTS, EMAILS, ENTITY_TYPES, TIME_UNITS } from "./../Config";
import Sanitize from "./../utils/sanitize";
import sendEmail from "./../utils/sendEmail";
import * as Invites from "../models/Invites/index";
import * as Time from "./../utils/time";
import * as Users from "../models/Users/index";
import * as Orgs from "../models/Orgs/index";
import errorFormatter from "../utils/errorFormatter";
const UrlSafeString = require("url-safe-string"),
  tagGenerator = new UrlSafeString();

export const create = async (req: Request, res: Response) => {
  const { body } = req;
  const recipientEmail = body.recipientEmail.trim();

  if (req.session.user.email === recipientEmail) {
    return res.status(400).json({ message: "You can't invite yourself" }); // TODO errors enum
  }

  if (req.session.user.orgId === DEFAULTS.NO_ORG) {
    return res.status(400).json({
      message: `You must create an organization before inviting users`, // TODO errors enum
    });
  }

  const [org, error] = await Orgs.getOrgById({ orgId: req.session.user.orgId });

  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(formattedError.httpStatusCode).json({
      message: "An error ocurred retrieving your org information",
      ...formattedError,
    });
  }

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

  let [recipient, recipientError] = await Users.getUserByEmail({
    email: recipientEmail,
  });

  if (recipientError) {
    const formattedError = errorFormatter(recipientError);
    return res.status(formattedError.httpStatusCode).json({
      message: "An error ocurred getting your invitee's information",
      ...formattedError,
    });
  }

  if (!recipient) {
    const [createdUser, createUserError] = await Users.createUser({
      email: recipientEmail,
    });

    if (createUserError) {
      const formattedError = errorFormatter(createUserError);
      return res.status(formattedError.httpStatusCode).json({
        message: "An error ocurred creating an account for your invitee",
        ...formattedError,
      });
    }
    recipient = createdUser;
  }
  if (recipient.orgId === req.session.user.orgId) {
    return res.status(400).json({ message: "User is already in your org!" });
  }

  // Check if the user we are inviting already has pending invites for the current org
  const [recipientInvites, recipientInvitesError] =
    await Users.getInvitesForUser({
      userId: recipient.userId,
    });

  if (recipientInvitesError) {
    const formattedError = errorFormatter(recipientInvitesError);
    return res.status(formattedError.httpStatusCode).json({
      message:
        "An error ocurred while checking to see if your invitee has pending invites",
      ...formattedError,
    });
  }

  const pendingInvites = recipientInvites.some(
    // Some returns true if any match the condition
    (invite) => invite.orgId === req.session.user.orgId
  );

  if (pendingInvites) {
    return res.status(409).json({
      message:
        "This user already has a pending invite to your org! They can log in to claim it.",
    });
  }

  const [inviteCreated, inviteError] = await Invites.createInvite({
    orgId: org.orgId,
    recipient: recipient,
    orgName: org.GSI1SK,
    expiresAt: Time.futureISO(3, TIME_UNITS.DAYS),
    createdBy: req.session.user,
  });

  if (inviteError) {
    const formattedError = errorFormatter(inviteError);
    return res.status(formattedError.httpStatusCode).json({
      message: "An error ocurred creating your invite",
      ...formattedError,
    });
  }

  const [emailSent, emailFailure] = await sendEmail({
    // TODO async decouple this
    fromName: org.GSI1SK,
    fromAddress: EMAILS.GENERAL,
    toAddresses: [recipientEmail],
    subject: `${req.session.user.firstName} ${req.session.user.lastName} has invited you to join them on Plutomi!`,
    html: `<h4>You can log in at <a href="${process.env.WEBSITE_URL}" target="_blank" rel=noreferrer>${process.env.WEBSITE_URL}</a> to accept it!</h4><p>If you believe this email was received in error, you can safely ignore it.</p>`,
  });

  console.log(
    "Test",

    {
      // TODO async decouple this
      fromName: org.GSI1SK,
      fromAddress: EMAILS.GENERAL,
      toAddresses: [recipientEmail],
      subject: `${req.session.user.firstName} ${req.session.user.lastName} has invited you to join them on Plutomi!`,
      html: `<h4>You can log in at <a href="${process.env.WEBSITE_URL}" target="_blank" rel=noreferrer>${process.env.WEBSITE_URL}</a> to accept it!</h4><p>If you believe this email was received in error, you can safely ignore it.</p>`,
    }
  );
  if (emailFailure) {
    const formattedError = errorFormatter(emailFailure);
    return res.status(formattedError.httpStatusCode).json({
      message:
        "The invite was created, but we were not able to send an email to the user. They can log in and accept their invite!",
      ...formattedError,
    });
  }

  return res
    .status(201)
    .json({ message: `Invite sent to '${recipientEmail}'` });
};

export const accept = async (req: Request, res: Response) => {
  const { inviteId } = req.params;

  if (req.session.user.orgId !== DEFAULTS.NO_ORG) {
    return res.status(400).json({
      message: `You already belong to an org: ${req.session.user.orgId} - delete it before joining another one!`,
    });
  }

  const [invite, error] = await Invites.getInviteById({
    inviteId: inviteId,
    userId: req.session.user.userId,
  });

  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(formattedError.httpStatusCode).json({
      message: "An error ocurred getting the info for your invite",
      ...formattedError,
    });
  }

  if (!invite) {
    return res.status(400).json({ message: `Invite no longer exists` });
  }

  const [joined, joinError] = await Invites.joinOrgFromInvite({
    userId: req.session.user.userId,
    invite,
  });

  if (joinError) {
    const formattedError = errorFormatter(joinError);
    return res.status(formattedError.httpStatusCode).json({
      message: "We were unable to join that org",
      ...formattedError,
    });
  }

  const [updatedUser, updatedUserFailure] = await Users.getUserById({
    userId: req.session.user.userId,
  });

  if (updatedUserFailure) {
    const formattedError = errorFormatter(updatedUserFailure);
    return res.status(formattedError.httpStatusCode).json({
      message:
        "We were able to succesfully join the org, but we were unable to update your session. Please log out and log in again!",
      ...formattedError,
    });
  }
  req.session.user = Sanitize.clean(updatedUser, ENTITY_TYPES.USER);
  await req.session.save();
  return res
    .status(200)
    .json({ message: `You've joined the ${invite.orgName} org!` });
};

export const reject = async (req: Request, res: Response) => {
  const { inviteId } = req.params;

  const [deleted, error] = await Invites.deleteInvite({
    inviteId: inviteId,
    userId: req.session.user.userId,
  });

  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(formattedError.httpStatusCode).json({
      message: "We were unable to delete that invite",
      ...formattedError,
    });
  }
  req.session.user.totalInvites -= 1;
  await req.session.save();
  return res.status(200).json({ message: "Invite rejected!" }); // TODO enum for RESPONSES
};
