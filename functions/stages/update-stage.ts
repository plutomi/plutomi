import * as Openings from "../../models/openings";
import * as Stages from "../../models/stages";
import Joi from "joi";
import {
  JOI_GLOBAL_FORBIDDEN,
  JOI_SETTINGS,
  withDefaultMiddleware,
} from "../../Config";
import middy from "@middy/core";

import {
  CustomLambdaEvent,
  CustomLambdaResponse,
  UpdateOpeningInput,
} from "../../types/main";
import * as Response from "../../utils/customResponse";
import { DynamoNewStage } from "../../types/dynamo";
interface APIUpdateStagePathParameters {
  openingId: string;
  stageId: string;
}

interface APIUpdateStageBody {
  newValues: {
    [key: string]: any;
  };
}
interface APIUpdateStageEvent
  extends Omit<CustomLambdaEvent, "body" | "pathParameters"> {
  body: APIUpdateStageBody;
  pathParameters: APIUpdateStagePathParameters;
}

const JOI_FORBIDDEN_STAGE = Joi.object({
  ...JOI_GLOBAL_FORBIDDEN,
  openingId: Joi.any().forbidden().strip(),
  stageId: Joi.any().forbidden().strip(),
  GSI1PK: Joi.any().forbidden().strip(),
  totalApplicants: Joi.any().forbidden().strip(),
});

const schema = Joi.object({
  pathParameters: {
    openingId: Joi.string(),
    stageId: Joi.string(),
  },
  body: {
    newValues: JOI_FORBIDDEN_STAGE,
  },
}).options(JOI_SETTINGS);

const main = async (
  event: APIUpdateStageEvent
): Promise<CustomLambdaResponse> => {
  try {
    await schema.validateAsync(event);
  } catch (error) {
    return Response.JOI(error);
  }

  const { session } = event.requestContext.authorizer.lambda;
  const { openingId, stageId } = event.pathParameters;
  const { newValues } = event.body;

  // TODO if stage order is defined
  const [updatedOpening, error] = await Stages.updateStage({
    orgId: session.orgId,
    openingId,
    stageId,
    newValues,
  });

  if (error) {
    return Response.SDK(error, "An error ocurred updating this stage");
  }

  return {
    statusCode: 200,
    body: {
      message: "Stage updated!",
    },
  };
};

// TODO types with API Gateway event and middleware
// @ts-ignore
module.exports.main = middy(main).use(withDefaultMiddleware);
