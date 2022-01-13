import * as Orgs from "../../models/Orgs";
import middy from "@middy/core";
import { DEFAULTS, withDefaultMiddleware } from "../../Config";
import createSDKErrorResponse from "../../utils/createSDKErrorResponse";
import { CustomLambdaEvent, CustomLambdaResponse } from "../../types/main";

const main = async (
  event: CustomLambdaEvent
): Promise<CustomLambdaResponse> => {
  const { session } = event.requestContext.authorizer.lambda;

  if (session.orgId === DEFAULTS.NO_ORG) {
    return {
      statusCode: 400,
      body: {
        message: `You must create an organization before retrieving openings`,
      },
    };
  }

  const [openings, openingsError] = await Orgs.getOpeningsInOrg({
    orgId: session.orgId,
  });

  if (openingsError) {
    return createSDKErrorResponse(
      openingsError,
      "An error ocurred retrieving openings"
    );
  }

  return {
    statusCode: 200,
    body: openings,
  };
};

// TODO types with API Gateway event and middleware
// @ts-ignore
module.exports.main = middy(main).use(withDefaultMiddleware);
