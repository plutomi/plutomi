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
    // Provide one or the other, or none, but not both. We handle that logic
    // If none are provided, stage is added to the end by default
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

  // TODO make sure that opening actually exists
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
  /**
   * TODO Please note, (update this query to be recursive):
   * If we don't get all stages in this query this might cause some issues
   * if the stages we need to update are not in the query results
   */
  const [allCurrentStages, allStagesError] = await Openings.getStagesInOpening({
    openingId,
    orgId: session.orgId,
  });

  console.log("Current stages", allCurrentStages);

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

  console.log("Missing previous", missingPreviousStage);
  console.log("Missing next", missingNextStage);

  if (missingPreviousStage || missingNextStage) {
    return {
      statusCode: 400,
      body: {
        message:
          "The provided stage id does not exist in the stages of the opening",
      },
    };
  }

  /**
   * If the stage being created is the first one in the opening:
   */
  if (allCurrentStages.length === 0) {
    console.log("This will be the first stage");
    previousStage = null;
    nextStage = null;
  }

  /**
   * If there are stages & nextStage and previousStage are null,
   * the stage will be added to the end of the opening by default
   */
  if (allCurrentStages.length > 0 && !nextStage && !previousStage) {
    console.log(
      "Stage will be added to the end by default as stage ids are missing"
    );
    // .at kept throwing errors??
    // previousStage = allCurrentStages.at(-1).stageId;
    previousStage = allCurrentStages[allCurrentStages.length - 1].stageId;
    nextStage = null;

    console.log("Previous stage will be", previousStage);
  }

  // Else, call create a stage and let the model decide which stages to update
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
