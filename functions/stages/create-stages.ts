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

  const [created, error] = await Stages.createStage({
    orgId: session.orgId,
    GSI1SK,
    openingId,
  });

  const [created, createOpeningError] = await Openings.createOpening({
    orgId: session.orgId,
    GSI1SK,
  });

  if (createOpeningError) {
    return Response.SDK(
      createOpeningError,
      "An error ocurred creating opening"
    );
  }

  return {
    statusCode: 201,
    body: { message: "Opening created!" },
  };
};

// TODO types with API Gateway event and middleware
// @ts-ignore
module.exports.main = middy(main).use(withDefaultMiddleware);
