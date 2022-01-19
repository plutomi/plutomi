import middy from "@middy/core";
import Joi from "joi";
import emailValidator from "deep-email-validator";
import { JOI_SETTINGS, DEFAULTS, TIME_UNITS } from "../../Config";
import * as Invites from "../../models/Invites";
import * as Time from "../../utils/time";
import * as Users from "../../models/Users";
import * as Orgs from "../../models/Orgs";
import { CustomLambdaEvent, CustomLambdaResponse } from "../../types/main";
import * as CreateError from "../../utils/errorGenerator";
interface APICreateInvitesBody {
  recipientEmail?: string;
}
interface APICreateInvitesEvent extends Omit<CustomLambdaEvent, "body"> {
  body: APICreateInvitesBody;
}

const schema = Joi.object({
  body: {
    recipientEmail: Joi.string().email().trim(),
  },
}).options(JOI_SETTINGS);

const main = async (
  event: APICreateInvitesEvent
): Promise<CustomLambdaResponse> => {
  try {
    await schema.validateAsync(event);
  } catch (error) {
    return CreateError.JOI(error);
  }

  const res = await emailValidator({
    email: event.body.recipientEmail,
    validateSMTP: false, // BUG, this isnt working
  });
  if (!res.valid) {
    return {
      statusCode: 400,
      body: {
        message: "Hmm... that email doesn't seem quite right. Check it again.",
      },
    };
  }

  const { session } = event.requestContext.authorizer.lambda;

  const { recipientEmail } = event.body;

  if (session.email === recipientEmail) {
    return {
      statusCode: 400,
      body: { message: `You can't invite yourself` },
    };
  }

  if (session.orgId === DEFAULTS.NO_ORG) {
    return {
      statusCode: 400,
      body: {
        message: `You must create an organization before inviting users`,
      },
    };
  }

  const [org, error] = await Orgs.getOrgById({ orgId: session.orgId });

  if (error) {
    return CreateError.SDK(
      error,
      "An error ocurred retrieving your org information"
    );
  }

  let [recipient, recipientError] = await Users.getUserByEmail({
    email: recipientEmail,
  });

  if (recipientError) {
    return CreateError.SDK(
      error,
      "An error ocurred getting your invitee's information"
    );
  }

  // Invite is for a user that doesn't exist
  if (!recipient) {
    const [createdUser, createUserError] = await Users.createUser({
      email: recipientEmail,
    });

    if (createUserError) {
      return CreateError.SDK(
        createUserError,
        "An error ocurred creating an account for your invitee"
      );
    }
    recipient = createdUser;
  }

  if (recipient.orgId === session.orgId) {
    return {
      statusCode: 403,
      body: { message: "User is already in your org!" },
    };
  }

  // Check if the user we are inviting already has pending invites for the current org
  const [recipientInvites, recipientInvitesError] =
    await Users.getInvitesForUser({
      userId: recipient.userId,
    });

  if (recipientInvitesError) {
    return CreateError.SDK(
      recipientInvitesError,
      "An error ocurred while checking to see if your invitee has pending invites"
    );
  }

  // .some() returns true if any item matches the condition
  const pendingInvites = recipientInvites.some(
    (invite) => invite.orgId === session.orgId
  );

  if (pendingInvites) {
    return {
      statusCode: 403,
      body: {
        message:
          "This user already has a pending invite to your org! They can log in to claim it.",
      },
    };
  }

  const [inviteCreated, inviteError] = await Invites.createInvite({
    recipient,
    orgName: org.displayName,
    expiresAt: Time.futureISO(3, TIME_UNITS.DAYS), // TODO https://github.com/plutomi/plutomi/issues/333
    createdBy: session, // TODO this has too much snesitive data https://github.com/plutomi/plutomi/issues/513
  });

  if (inviteError) {
    return CreateError.SDK(
      inviteError,
      "An error ocurred creating your invite"
    );
  }

  // Email sent asynchronously through step functions
  return {
    statusCode: 201,
    body: { message: `Invite sent to '${recipientEmail}'` },
  };
};
// TODO types with API Gateway event and middleware
// @ts-ignore
