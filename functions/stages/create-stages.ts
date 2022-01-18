import * as Openings from "../../models/Openings";
import middy from "@middy/core";
import Joi from "joi";
import * as Stages from "../../models/Stages";
import { JOI_SETTINGS, DEFAULTS, withDefaultMiddleware } from "../../Config";
import { CustomLambdaEvent, CustomLambdaResponse } from "../../types/main";
import * as Response from "../../utils/customResponse";
interface APICreateStagesBody {
  GSI1SK: string;
  openingId: string;
  nextStage?: string;
  previousStage?: string;
}
interface APICreateStagesEvent extends Omit<CustomLambdaEvent, "body"> {
  body: APICreateStagesBody;
}

const schema = Joi.object({
  body: {
    // Stage name
    GSI1SK: Joi.string().max(100),
    openingId: Joi.string(),
    /**
     * Provide one or the other, or none, but not both. We handle that logic for you.
     * If none are provided, stage is added to the end by default
     */
    nextStage: Joi.string().default(null).optional(),
    previousStage: Joi.string().default(null).optional(),
  },
}).options(JOI_SETTINGS);

const main = async (
  event: APICreateStagesEvent
): Promise<CustomLambdaResponse> => {
  try {
    await schema.validateAsync(event);
  } catch (error) {
    return Response.JOI(error);
  }

  const { session } = event.requestContext.authorizer.lambda;
  let { GSI1SK, openingId, nextStage, previousStage } = event.body;

  if (session.orgId === DEFAULTS.NO_ORG) {
    return {
      statusCode: 400,
      body: {
        message: `You must create an organization before creating stages`,
      },
    };
  }

  // TODO get this working in Joi, xor wasn't working or I just didnt read it correctly
  if (previousStage && nextStage) {
    return {
      statusCode: 400,
      body: {
        message:
          "Please only use 'nextStage' OR 'previousStage', but not both.",
      },
    };
  }

  const [opening, openingError] = await Openings.getOpeningById({
    openingId,
    orgId: session.orgId,
  });

  if (openingError) {
    return Response.SDK(openingError, "Unable to retrieve opening info");
  }

  if (!opening) {
    return {
      statusCode: 404,
      body: { message: "Opening does not exist" },
    };
  }
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

  // If there is a value provided, make sure it currently exists in the currentStages
  const missingPreviousStage =
    previousStage &&
    !allCurrentStages.some((stage) => stage.stageId === previousStage);

  const missingNextStage =
    nextStage && !allCurrentStages.some((stage) => stage.stageId === nextStage);

  if (missingPreviousStage || missingNextStage) {
    return {
      statusCode: 400,
      body: {
        message:
          "The provided stage id does not exist in the stages of the opening",
      },
    };
  }

  const firstStageInOpening = allCurrentStages.length === 0;

  const noPositionProvided =
    allCurrentStages.length > 0 && !nextStage && !previousStage;

  const stageFallsInBetweenOthers = !firstStageInOpening && !noPositionProvided;
  /**
   * If there are no other stages in this opening
   */
  if (firstStageInOpening) {
    previousStage = null;
    nextStage = null;
  }

  /**
   * If no nextStage or previousStage were provided, the stage will be added to the end of the opening
   */
  if (noPositionProvided) {
    previousStage = allCurrentStages.at(-1).stageId;
    nextStage = null;
  }

  //
  /**
   * Find the corresponding stages if the stage is between others
   */
  if (stageFallsInBetweenOthers) {
    // If the user provided a previousStage, find the stage that comes after it
    if (previousStage) {
      // To get the index of the user provided stageId
      const tempPreviousStage = allCurrentStages.find(
        (stage) => stage.stageId === previousStage
      );
      // Set the next stage to that index + 1
      nextStage =
        allCurrentStages[allCurrentStages.indexOf(tempPreviousStage) + 1]
          .stageId;
    }

    // If the user provided a nextStage, find the previous stage
    if (nextStage) {
      const tempNextStage = allCurrentStages.find(
        (stage) => stage.stageId === nextStage
      );
      previousStage =
        allCurrentStages[allCurrentStages.indexOf(tempNextStage) - 1].stageId;
    }
  }

  // Create the stage and let the model decide which stages to update
  const [created, stageError] = await Stages.createStage({
    orgId: session.orgId,
    GSI1SK,
    openingId,
    previousStage,
    nextStage,
  });

  if (stageError) {
    return Response.SDK(stageError, "An error ocurred creating your stage");
  }

  return {
    statusCode: 201,
    body: { message: "Stage created!" },
  };
};

// TODO types with API Gateway event and middleware
// @ts-ignore
module.exports.main = middy(main).use(withDefaultMiddleware);
