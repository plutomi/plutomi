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
    // If these are not provided, stage is added to the end by default
    nextStage: Joi.string().optional(),
    previousStage: Joi.string().optional(),
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
  const { GSI1SK, openingId, nextStage, previousStage } = event.body;

  if (session.orgId === DEFAULTS.NO_ORG) {
    return {
      statusCode: 400,
      body: {
        message: `You must create an organization before creating stages`,
      },
    };
  }

  // TODO Please note, (update this query to be recursive): If we don't get all stages in this query this might cause some issues
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

  /**
   * First stage in opening
   */
  if (allCurrentStages.length === 0) {
    const [created, error] = await Stages.createStage({
      orgId: session.orgId,
      GSI1SK,
      openingId,
      previousStage: null,
      nextStage: null,
    });

    if (error) {
      return Response.SDK(error, "An error ocurred creating your stage");
    }

    return {
      statusCode: 201,
      body: { message: "Stage created!" },
    };
  }

  /**
   * If there are stages, nextStage and previousStage CAN be null,
   * and the stage will be added to the end of the opening by default
   */
  if (!nextStage && !previousStage) {
    const [created, error] = await Stages.createStage({
      orgId: session.orgId,
      GSI1SK,
      openingId,
      previousStage: allCurrentStages.at(-1).stageId,
      nextStage: null,
    });

    if (error) {
      return Response.SDK(error, "An error ocurred creating your stage");
    }

    return {
      statusCode: 201,
      body: { message: "Stage created!" },
    };
  }

  const currentFirst = allCurrentStages.find(
    (stage) => stage.previousStage === null
  );
  const currentLast = allCurrentStages.find(
    (stage) => stage.nextStage === null
  );

  /**
   * We already check for 2 nulls on nextStage and previousStage above
   * which adds the stage to the end..
   * So if there is ONE stage,
   * nextStage OR previousStage MUST equal that stageId, and the other must be null
   */
  // TODO  be thisshoulda function that checks if the provied values exists in the stage list
  if (currentFirst === currentLast) {
    if (
      (!nextStage && previousStage === currentFirst.stageId) ||
      (!previousStage && nextStage === currentFirst.stageId)
    ) {
      return {
        statusCode: 400,
        body: {message: `There is only one opening in this stage and either the 'previousStage' or 'nextStage' ids that you provided do not match up to that stage`}
      }
    }
  }

  const [created, error] = await Stages.createStage({
    orgId: session.orgId,
    GSI1SK,
    openingId,
    previousStage,
    nextStage,
  });

  return {
    statusCode: 201,
    body: { message: "Stage created!" },
  };
};

// TODO types with API Gateway event and middleware
// @ts-ignore
module.exports.main = middy(main).use(withDefaultMiddleware);
