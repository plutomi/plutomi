import Joi from "joi";
import { JOI_SETTINGS, JoiOrgId, withDefaultMiddleware } from "../../Config";
import middy from "@middy/core";
import * as Orgs from "../../models/Orgs";
import { CustomLambdaEvent, CustomLambdaResponse } from "../../types/main";
import * as Response from "../../utils/customResponse";
import { pick } from "lodash";
interface APIGetOrgInfoPathParameters {
  orgId: string;
}
interface APIGetPublicOrgInfoEvent
  extends Omit<CustomLambdaEvent, "pathParameters"> {
  pathParameters: APIGetOrgInfoPathParameters;
}

const schema = Joi.object({
  pathParameters: {
    orgId: JoiOrgId,
  },
}).options(JOI_SETTINGS);

const main = async (
  event: APIGetPublicOrgInfoEvent
): Promise<CustomLambdaResponse> => {
  try {
    await schema.validateAsync(event);
  } catch (error) {
    console.log(error);
    return Response.JOI(error);
  }

  const { orgId } = event.pathParameters;

  const [org, orgError] = await Orgs.getOrgById({ orgId });

  if (orgError) {
    return Response.SDK(orgError, "Unable to retrieve org info");
  }

  if (!org) {
    return {
      statusCode: 404,
      body: { message: "Org not found" },
    };
  }

  const modifiedOrg = pick(org, ["orgId", "displayName"]);
  return {
    statusCode: 200,
    body: modifiedOrg,
  };
};
// TODO types with API Gateway event and middleware
// @ts-ignore
module.exports.main = middy(main).use(withDefaultMiddleware);
