import Joi from "joi";
import {
  JOI_SETTINGS,
  DEFAULTS,
  SESSION_SETTINGS,
  COOKIE_SETTINGS,
  JoiOrgId,
  COOKIE_NAME,
  withDefaultMiddleware,
} from "../../Config";
import middy from "@middy/core";
import * as Orgs from "../../models/Orgs";

import { CustomLambdaEvent, CustomLambdaResponse } from "../../types/main";
import * as Response from "../../utils/customResponse";
interface APIDeleteOrgPathParameters {
  orgId?: string;
}
interface APIDeleteOrgEvent extends Omit<CustomLambdaEvent, "pathParameters"> {
  pathParameters: APIDeleteOrgPathParameters;
}

const schema = Joi.object({
  pathParameters: {
    orgId: JoiOrgId,
  },
}).options(JOI_SETTINGS);

const main = async (
  event: APIDeleteOrgEvent
): Promise<CustomLambdaResponse> => {
  try {
    await schema.validateAsync(event);
  } catch (error) {
    return Response.JOI(error);
  }

  const { session } = event.requestContext.authorizer.lambda;
  const { orgId } = event.pathParameters;

  if (session.orgId !== orgId) {
    // TODO i think we can move this to Joi
    return {
      statusCode: 403,
      body: {
        message: "You cannot delete this org as you do not belong to it",
      },
    };
  }

  const [org, error] = await Orgs.getOrgById({ orgId });

  if (error) {
    return Response.SDK(error, "Unable to retrieve org info");
  }

  if (!org) {
    return {
      statusCode: 404,
      body: { message: "Org not found" },
    };
  }
  if (org.totalUsers > 1) {
    return {
      statusCode: 403,
      body: {
        message: "You cannot delete this org as there are other users in it",
      },
    };
  }

  // Transaction - updates the user with default org values
  const [success, failure] = await Orgs.leaveAndDeleteOrg({
    orgId,
    userId: session.userId,
  });

  if (failure) {
    return Response.SDK(failure, "We were unable to remove you from the org");
  }

  return {
    statusCode: 201,
    body: { message: "Org deleted!" },
  };
};

// TODO types with API Gateway event and middleware
// @ts-ignore
module.exports.main = middy(main).use(withDefaultMiddleware);
