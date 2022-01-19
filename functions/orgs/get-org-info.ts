import Joi from "joi";
import { JOI_SETTINGS, JoiOrgId, DEFAULTS } from "../../Config";
import middy from "@middy/core";
import * as Orgs from "../../models/Orgs";

import { CustomLambdaEvent, CustomLambdaResponse } from "../../types/main";
import * as CreateError from "../../utils/errorGenerator";
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
    return CreateError.JOI(error);
  }

  const { session } = event.requestContext.authorizer.lambda;
  const { orgId } = event.pathParameters;

  if (orgId !== session.orgId || session.orgId === DEFAULTS.NO_ORG) {
    return {
      statusCode: 403,
      body: {
        message: "You cannot view this org",
      },
    };
  }

  const [org, error] = await Orgs.getOrgById({ orgId });

  if (error) {
    return CreateError.SDK(error, "Unable to retrieve org info");
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
