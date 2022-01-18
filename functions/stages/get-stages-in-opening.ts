import * as Openings from "../../models/Openings";
import middy from "@middy/core";
import Joi from "joi";
import { JOI_SETTINGS, DEFAULTS, withDefaultMiddleware } from "../../Config";
import { CustomLambdaEvent, CustomLambdaResponse } from "../../types/main";
import * as Response from "../../utils/customResponse";

interface APIGetStagesInOpeningEvent
  extends Omit<CustomLambdaEvent, "pathParameters"> {
  pathParameters: {
    openingId: string;
  };
}

const schema = Joi.object({
  pathParameters: {
    openingId: Joi.string(),
  },
}).options(JOI_SETTINGS);

const main = async (
  event: APIGetStagesInOpeningEvent
): Promise<CustomLambdaResponse> => {
  try {
    await schema.validateAsync(event);
  } catch (error) {
    return Response.JOI(error);
  }

  const { session } = event.requestContext.authorizer.lambda;

  if (session.orgId === DEFAULTS.NO_ORG) {
    return {
      statusCode: 400,
      body: {
        message: `You must create an organization before viewing stages for an opening`,
      },
    };
  }

  const { openingId } = event.pathParameters;
  /**
   * TODO Please note, (update this query to be recursive):
   * If we don't get all stages in this query this might cause some issues
   * if the stages we need to update are not in the query results
   */
  const [allCurrentStages, allStagesError] = await Openings.getStagesInOpening({
    openingId,
    orgId: session.orgId,
  });


  if (allStagesError) {
    return Response.SDK(
      allStagesError,
      "An error ocurred retrieving all the current stages"
    );
  }

  return {
    statusCode: 200,
    body: allCurrentStages,
  };
};

// TODO types with API Gateway event and middleware
// @ts-ignore
module.exports.main = middy(main).use(withDefaultMiddleware);
