import middy from "@middy/core";
import Joi from "joi";
import * as Stages from "../../models/Stages";
import { JOI_SETTINGS, DEFAULTS, withDefaultMiddleware } from "../../Config";
import { CustomLambdaEvent, CustomLambdaResponse } from "../../types/main";
import * as Response from "../../utils/customResponse";

interface APIGetStagesInfoEvent
  extends Omit<CustomLambdaEvent, "pathParameters"> {
  pathParameters: {
    openingId: string;
    stageId: string;
  };
}

const schema = Joi.object({
  pathParameters: {
    openingId: Joi.string(),
    stageId: Joi.string(),
  },
}).options(JOI_SETTINGS);

const main = async (
  event: APIGetStagesInfoEvent
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
        message: `You must create an organization before viewing a stage`,
      },
    };
  }

  const { openingId, stageId } = event.pathParameters;
  const [stage, stageError] = await Stages.getStageById({
    orgId: session.orgId,
    stageId,
    openingId,
  });

  if (stageError) {
    return Response.SDK(
      stageError,
      "An error ocurred retrieving that stage info"
    );
  }

  return {
    statusCode: 200,
    body: stage,
  };
};

// TODO types with API Gateway event and middleware
// @ts-ignore
module.exports.main = middy(main).use(withDefaultMiddleware);
