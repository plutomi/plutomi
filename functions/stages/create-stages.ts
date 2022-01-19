import * as Openings from "../../models/Openings";
import middy from "@middy/core";
import Joi from "joi";
import * as Stages from "../../models/Stages";
import { JOI_SETTINGS, DEFAULTS, withDefaultMiddleware } from "../../Config";
import { CustomLambdaEvent, CustomLambdaResponse } from "../../types/main";
import * as CreateError from "../../utils/errorGenerator";
interface APICreateStagesBody {
  GSI1SK: string;
  openingId: string;
  position?: number;
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
     * 0 based index on where should the stage be added
     * If no position is provided, stage is added to the end of the opening
     */
    position: Joi.number()
      .min(0)
      .max(DEFAULTS.MAX_CHILD_ITEM_LIMIT - 1)
      .optional(),
  },
}).options(JOI_SETTINGS);

const main = async (
  event: APICreateStagesEvent
): Promise<CustomLambdaResponse> => {
  try {
    await schema.validateAsync(event);
  } catch (error) {
    return CreateError.JOI(error);
  }

  const { session } = event.requestContext.authorizer.lambda;
  let { GSI1SK, openingId, position } = event.body;

  if (session.orgId === DEFAULTS.NO_ORG) {
    return {
      statusCode: 400,
      body: {
        message: `You must create an organization before creating stages`,
      },
    };
  }

  const [opening, openingError] = await Openings.getOpeningById({
    openingId,
    orgId: session.orgId,
  });

  if (openingError) {
    return CreateError.SDK(openingError, "Unable to retrieve opening info");
  }

  if (!opening) {
    return {
      statusCode: 404,
      body: { message: "Opening does not exist" },
    };
  }

  // Create the stage and update the stage order, model will handle where to place it
  const [created, stageError] = await Stages.createStage({
    orgId: session.orgId,
    GSI1SK,
    openingId,
    position,
    stageOrder: opening.stageOrder,
  });

  if (stageError) {
    return CreateError.SDK(stageError, "An error ocurred creating your stage");
  }

  return {
    statusCode: 201,
    body: { message: "Stage created!" },
  };
};

// TODO types with API Gateway event and middleware
// @ts-ignore
