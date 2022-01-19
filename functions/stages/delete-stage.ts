import middy from "@middy/core";
import Joi from "joi";
import * as Stages from "../../models/Stages";
import * as Openings from "../../models/Openings";
import { JOI_SETTINGS, DEFAULTS, withDefaultMiddleware } from "../../Config";
import { CustomLambdaEvent, CustomLambdaResponse } from "../../types/main";
import * as CreateError from "../../utils/errorGenerator";

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
    return CreateError.JOI(error);
  }

  const { session } = event.requestContext.authorizer.lambda;

  if (session.orgId === DEFAULTS.NO_ORG) {
    return {
      statusCode: 400,
      body: {
        message: `You must be in an organization to be able to delete stages`,
      },
    };
  }

  const { openingId, stageId } = event.pathParameters;
  const [opening, openingError] = await Openings.getOpeningById({
    openingId,
    orgId: session.orgId,
  });

  if (openingError) {
    return CreateError.SDK(
      openingError,
      "An error ocurred retrieving your opening info"
    );
  }

  const [deleted, error] = await Stages.deleteStage({
    openingId,
    orgId: session.orgId,
    stageId,
    stageOrder: opening.stageOrder,
  });

  if (error) {
    return CreateError.SDK(error, "An error ocurred deleting that stage");
  }

  return {
    statusCode: 200,
    body: { message: "Stage deleted" },
  };
};

// TODO types with API Gateway event and middleware
// @ts-ignore
