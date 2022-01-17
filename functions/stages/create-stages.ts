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
     *  If nextStage is not provided, stage is added to the end of the opening
     *  previousStage will be the current final stage in an opening.
     *
     * If nextStage is provided and previousStage is NOT the current first stage,
     * this should throw an error.
     *
     * If nextStage is provided and nextStage IS the current first stage,
     * previousStage can be null
     */
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

  // Please note: If we don't get all stages in this query this might cause some issues
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

  if (allCurrentStages.length === 0) {
    /**
     * TODO If there are no stages:
     * previousStage: null
     * nextStage: null
     */
  }

  if (!nextStage && !previousStage) {
    /**
     * If there are stages, nextStage and previousStage CAN be null,
     * but the stage will be added to the end of the opening by default
     * TODO add to ending of the opening
     * previousStage: allStages.at(-1).stageId,
     * nextStage: null
     */
  }

  const currentFirst = allCurrentStages.find(
    (stage) => stage.previousStage === null
  );
  const currentLast = allCurrentStages.find(
    (stage) => stage.nextStage === null
  );

  if (currentFirst === currentLast) {
    /**
     * TODO if there is only one stage:
     * nextStage OR previousStage must be null
     */

    if (nextStage === previousStage) {
      /**
       * TODO throw error, this is invalid
       */
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
