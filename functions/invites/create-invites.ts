import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import Joi from "joi";
import {
  CustomJoi,
  NO_SESSION_RESPONSE,
  JOI_SETTINGS,
  DEFAULTS,
  JoiOrgId,
  TIME_UNITS,
} from "../../Config";
import * as Invites from "../../models/Invites";
import * as Time from "../../utils/time";
import * as Users from "../../models/Users";
import errorFormatter from "../../utils/errorFormatter";
import getSessionFromCookies from "../../utils/getSessionFromCookies";
import * as Orgs from "../../models/Orgs";
const UrlSafeString = require("url-safe-string"),
  tagGenerator = new UrlSafeString();

export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  console.log(event);
  const [session, sessionError] = await getSessionFromCookies(event);
  console.log({
    session,
    sessionError,
  });
  if (sessionError) {
    return NO_SESSION_RESPONSE;
  }

  const body = JSON.parse(event.body || "{}");
  const input = {
    body,
  };

  const schema = CustomJoi.object({
    body: {
      recipientEmail: Joi.string().email().trim(),
    },
  }).options(JOI_SETTINGS);

  // Validate input
  try {
    await schema.validateAsync(input);
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: `${error.message}` }),
    };
  }

  const { recipientEmail } = body;

  if (session.email === recipientEmail) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: `You can't invite yourself` }),
    };
  }

  if (session.orgId === DEFAULTS.NO_ORG) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: `You must create an organization before inviting users`,
      }),
    };
  }

  const [org, error] = await Orgs.getOrgById({ orgId: session.orgId });

  if (error) {
    const formattedError = errorFormatter(error);
    return {
      statusCode: formattedError.httpStatusCode,
      body: JSON.stringify({
        message: "An error ocurred retrieving your org information",
        ...formattedError,
      }),
    };
  }

  let [recipient, recipientError] = await Users.getUserByEmail({
    email: recipientEmail,
  });

  if (recipientError) {
    const formattedError = errorFormatter(recipientError);
    return {
      statusCode: formattedError.httpStatusCode,
      body: JSON.stringify({
        message: "An error ocurred getting your invitee's information",
        ...formattedError,
      }),
    };
  }

  // Invite is for a user that doesn't exist
  if (!recipient) {
    const [createdUser, createUserError] = await Users.createUser({
      email: recipientEmail,
    });

    if (createUserError) {
      const formattedError = errorFormatter(createUserError);
      return {
        statusCode: formattedError.httpStatusCode,
        body: JSON.stringify({
          message: "An error ocurred creating an account for your invitee",
          ...formattedError,
        }),
      };
    }
    recipient = createdUser;
  }

  if (recipient.orgId === session.orgId) {
    return {
      statusCode: 403,
      body: JSON.stringify({ message: "User is already in your org!" }),
    };
  }

  // Check if the user we are inviting already has pending invites for the current org
  const [recipientInvites, recipientInvitesError] =
    await Users.getInvitesForUser({
      userId: recipient.userId,
    });

  if (recipientInvitesError) {
    const formattedError = errorFormatter(recipientInvitesError);
    return {
      statusCode: formattedError.httpStatusCode,
      body: JSON.stringify({
        message:
          "An error ocurred while checking to see if your invitee has pending invites",
        ...formattedError,
      }),
    };
  }

  // Some returns true if any match the condition
  const pendingInvites = recipientInvites.some(
    (invite) => invite.orgId === session.userId
  );

  if (pendingInvites) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        message:
          "This user already has a pending invite to your org! They can log in to claim it.",
      }),
    };
  }

  const [inviteCreated, inviteError] = await Invites.createInvite({
    recipient: recipient,
    orgName: org.displayName,
    expiresAt: Time.futureISO(3, TIME_UNITS.DAYS),
    createdBy: session,
  });

  if (inviteError) {
    const formattedError = errorFormatter(inviteError);
    return {
      statusCode: formattedError.httpStatusCode,
      body: JSON.stringify({
        message: "An error ocurred creating your invite",
        ...formattedError,
      }),
    };
  }

  // Email sent asynchronously through step functions
  return {
    statusCode: 201,
    body: JSON.stringify({ message: `Invite sent to '${recipientEmail}'` }),
  };
}
