import middy from "@middy/core";
import Joi from "joi";
import { JOI_SETTINGS, JoiOrgId, withDefaultMiddleware } from "../../Config";
import * as Orgs from "../../models/Orgs";

import { CustomLambdaEvent, CustomLambdaResponse } from "../../types/main";
import * as CreateError from "../../utils/errorGenerator";
interface APIGetOrgInvitesPathParameters {
  orgId?: string;
}
interface APIGetOrgInvitesEvent
  extends Omit<CustomLambdaEvent, "pathParameters"> {
  pathParameters: APIGetOrgInvitesPathParameters;
}

const schema = Joi.object({
  pathParameters: {
    orgId: JoiOrgId,
  },
}).options(JOI_SETTINGS);

const main = async (
  event: APIGetOrgInvitesEvent
): Promise<CustomLambdaResponse> => {
  try {
    await schema.validateAsync(event);
  } catch (error) {
    return CreateError.JOI(error);
  }

  const { session } = event.requestContext.authorizer.lambda;
  const { orgId } = event.pathParameters;

  if (orgId !== session.orgId) {
    return {
      statusCode: 403,
      body: {
        message: "You cannot view the invites for this org",
      },
    };
  }

  const [invites, error] = await Orgs.getPendingInvites({ orgId });

  if (error) {
    return CreateError.SDK(error, "Unable to retrieve invites for org");
  }

  return {
    statusCode: 200,
    body: invites,
  };
};

// TODO types with API Gateway event and middleware
// @ts-ignore
