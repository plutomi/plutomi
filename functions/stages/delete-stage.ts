import middy from "@middy/core";
import Joi from "joi";
import * as Stages from "../../models/Stages";
import * as Openings from "../../models/Openings";

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

  // TODO make this query recursive to be sure to get all stages
  // We need this query to get the stage's current position and update
  // the linked list accordingly
  const [allStages, allStagesError] = await Openings.getStagesInOpening({
    openingId,
    orgId: session.orgId,
  });

  if (allStagesError) {
    return Response.SDK(
      allStagesError,
      "Unable to delete stage, error retrieving opening info"
    );
  }

  const stageToBeDeleted = allStages.find((stage) => stage.stageId === stageId);
  if (!stageToBeDeleted) {
    return {
      statusCode: 404,
      body: { message: "That stage does not exist" },
    };
  }

  const nextStage = allStages[allStages.indexOf(stageToBeDeleted) + 1];
  const previousStage = allStages[allStages.indexOf(stageToBeDeleted) - 1];
  const [deleted, error] = await Stages.deleteStage({
    openingId,
    orgId: session.orgId,
    stageId,
    // The delete stage model will handle updating the corresponding stages
    nextStage: nextStage ? nextStage.stageId : null,
    previousStage: previousStage ? previousStage.stageId : null,
  });

  if (error) {
    return Response.SDK(error, "An error ocurred deleting that stage");
  }

  return {
    statusCode: 200,
    body: { message: "Stage deleted" },
  };
};

// TODO types with API Gateway event and middleware
// @ts-ignore
module.exports.main = middy(main).use(withDefaultMiddleware);
