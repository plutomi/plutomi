import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import inputOutputLogger from "@middy/input-output-logger";
import middy from "@middy/core";
import httpResponseSerializer from "@middy/http-response-serializer";
import Joi from "joi";
import {
  NO_SESSION_RESPONSE,
  JOI_SETTINGS,
  DEFAULTS,
  TIME_UNITS,
  MIDDY_SERIALIZERS,
} from "../../Config";
import * as Invites from "../../models/Invites";
import * as Time from "../../utils/time";
import * as Users from "../../models/Users";
import * as Orgs from "../../models/Orgs";
import getSessionFromCookies from "../../utils/getSessionFromCookies";
import createJoiResponse from "../../utils/createJoiResponse";
import createSDKErrorResponse from "../../utils/createSDKErrorResponse";
const UrlSafeString = require("url-safe-string"),
  tagGenerator = new UrlSafeString();

const schema = Joi.object({
  body: {
    recipientEmail: Joi.string().email().trim(),
  },
}).options(JOI_SETTINGS);

const main = async (event) => {
  const [session, sessionError] = await getSessionFromCookies(event);
  console.log({
    session,
    sessionError,
  });
  if (sessionError) {
    return NO_SESSION_RESPONSE;
  }

  // Validate input
  try {
    await schema.validateAsync(event);
  } catch (error) {
    return createJoiResponse(error);
  }

  // TODO types
  // @ts-ignore
  const { recipientEmail } = body;

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
    return createSDKErrorResponse(
      error,
      "An error ocurred retrieving your org information"
    );
  }

  let [recipient, recipientError] = await Users.getUserByEmail({
    email: recipientEmail,
  });

  if (recipientError) {
    return createSDKErrorResponse(
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
      return createSDKErrorResponse(
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
    return createSDKErrorResponse(
      recipientInvitesError,
      "An error ocurred while checking to see if your invitee has pending invites"
    );
  }

  // Some returns true if any match the condition
  const pendingInvites = recipientInvites.some(
    (invite) => invite.orgId === session.userId
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
    recipient: recipient,
    orgName: org.displayName,
    expiresAt: Time.futureISO(3, TIME_UNITS.DAYS),
    createdBy: session,
  });

  if (inviteError) {
    return createSDKErrorResponse(
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

module.exports.main = middy(main)
  .use(httpEventNormalizer({ payloadFormatVersion: 2 }))
  .use(httpJsonBodyParser())
  .use(inputOutputLogger())
  .use(httpResponseSerializer(MIDDY_SERIALIZERS));
