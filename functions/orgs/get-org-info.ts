import Joi from "joi";
import { JOI_SETTINGS, JoiOrgId, withDefaultMiddleware } from "../../Config";
import middy from "@middy/core";
import * as Orgs from "../../models/Orgs";
import createSDKErrorResponse from "../../utils/createSDKErrorResponse";
import { CustomLambdaEvent, CustomLambdaResponse } from "../../types/main";
import * as Response from "../../utils/createResponse";
interface APIGetOrgInfoPathParameters {
  orgId?: string;
}
interface APIGetOrgInfoOrgEvent
  extends Omit<CustomLambdaEvent, "pathParameters"> {
  pathParameters: APIGetOrgInfoPathParameters;
}

const schema = Joi.object({
  pathParameters: {
    orgId: JoiOrgId,
  },
}).options(JOI_SETTINGS);

const main = async (
  event: APIGetOrgInfoOrgEvent
): Promise<CustomLambdaResponse> => {
  try {
    await schema.validateAsync(event);
  } catch (error) {
    return Response.JOI(error);
  }

  const { session } = event.requestContext.authorizer.lambda;
  const { orgId } = event.pathParameters;

  if (orgId !== session.orgId) {
    return {
      statusCode: 403,
      body: {
        message: "You cannot view this org",
      },
    };
  }

  const [org, error] = await Orgs.getOrgById({ orgId });

  if (error) {
    return createSDKErrorResponse(error, "Unable to retrieve org info");
  }

  if (!org) {
    return {
      statusCode: 404,
      body: { message: "Org not found" },
    };
  }

  return {
    statusCode: 200,
    body: org,
  };
};
// TODO types with API Gateway event and middleware
// @ts-ignore
module.exports.main = middy(main).use(withDefaultMiddleware);
