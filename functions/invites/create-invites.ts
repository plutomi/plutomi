import middy from "@middy/core";
import Joi from "joi";
import {
  JOI_SETTINGS,
  DEFAULTS,
  TIME_UNITS,
  withDefaultMiddleware,
} from "../../Config";
import * as Invites from "../../models/Invites";
import * as Time from "../../utils/time";
import * as Users from "../../models/Users";
import * as Orgs from "../../models/Orgs";
import { CustomLambdaEvent, CustomLambdaResponse } from "../../types/main";
import * as Response from "../../utils/customResponse";
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
    return Response.JOI(error);
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
    return Response.SDK(
      error,
      "An error ocurred retrieving your org information"
    );
  }

  let [recipient, recipientError] = await Users.getUserByEmail({
    email: recipientEmail,
  });

  if (recipientError) {
    return Response.SDK(
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
      return Response.SDK(
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
    return Response.SDK(
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
    return Response.SDK(inviteError, "An error ocurred creating your invite");
  }

  // Email sent asynchronously through step functions
  return {
    statusCode: 201,
    body: { message: `Invite sent to '${recipientEmail}'` },
  };
};
// TODO types with API Gateway event and middleware
// @ts-ignore
module.exports.main = middy(main).use(withDefaultMiddleware);
