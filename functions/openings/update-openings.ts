import Sanitize from "../../utils/sanitize";
import * as Openings from "../../models/openings";
import Joi from "joi";
import {
  FORBIDDEN_PROPERTIES,
  JOI_GLOBAL_FORBIDDEN,
  JOI_SETTINGS,
} from "../../Config";
import middy from "@middy/core";

import {
  CustomLambdaEvent,
  CustomLambdaResponse,
  UpdateOpeningInput,
} from "../../types/main";
import * as CreateError from "../../utils/errorGenerator";
interface APIUpdateOpeningPathParameters {
  openingId: string;
}
interface APIUpdateOpeningBody {
  newValues: { [key: string]: any };
}
interface APIUpdateOpeningEvent
  extends Omit<CustomLambdaEvent, "body" | "pathParameters"> {
  body: APIUpdateOpeningBody;
  pathParameters: APIUpdateOpeningPathParameters;
}

const JOI_FORBIDDEN_OPENING = Joi.object({
  ...JOI_GLOBAL_FORBIDDEN,
  openingId: Joi.any().forbidden().strip(),
  GSI1PK: Joi.any().forbidden().strip(),
  totalStages: Joi.any().forbidden().strip(),
  totalApplicants: Joi.any().forbidden().strip(),
});

const schema = Joi.object({
  pathParameters: {
    openingId: Joi.string(),
  },
  body: {
    newValues: JOI_FORBIDDEN_OPENING,
  },
}).options(JOI_SETTINGS);

const main = async (
  event: APIUpdateOpeningEvent
): Promise<CustomLambdaResponse> => {
  try {
    await schema.validateAsync(event);
  } catch (error) {
    return CreateError.JOI(error);
  }

  const { session } = event.requestContext.authorizer.lambda;
  const { openingId } = event.pathParameters;
  const { newValues } = event.body;

  const updateOpeningInput: UpdateOpeningInput = {
    openingId,
    orgId: session.orgId,
    newValues,
  };

  const [updatedOpening, error] = await Openings.updateOpening(
    updateOpeningInput
  );

  if (error) {
    return CreateError.SDK(error, "An error ocurred updating this opening");
  }

  return {
    statusCode: 200,
    body: {
      message: "Opening updated!",
    },
  };
};

// TODO types with API Gateway event and middleware
// @ts-ignore
