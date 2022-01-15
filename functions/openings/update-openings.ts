import Sanitize from "../../utils/sanitize";
import * as Openings from "../../models/openings";
import Joi from "joi";
import {
  FORBIDDEN_PROPERTIES,
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

const schema = Joi.object({
  pathParameters: {
    openingId: Joi.string(),
  },
  body: {
    newValues: Joi.object(),
  },
}).options(JOI_SETTINGS);

const main = async (
  event: APIUpdateOpeningEvent
): Promise<CustomLambdaResponse> => {
  try {
    await schema.validateAsync(event);
  } catch (error) {
    return Response.JOI(error);
  }

  const { session } = event.requestContext.authorizer.lambda;
  const { openingId } = event.pathParameters;
  const { newValues } = event.body;

  const filteredValues = Sanitize(
    "REMOVE",
    FORBIDDEN_PROPERTIES.OPENING,
    newValues
  );
  // TODO add this to all other update expressions, or combine them into one
  // Throw an error if all properties are invalid (empty object)
  if (Object.keys(filteredValues.object).length === 0) {
    return {
      statusCode: 400,
      body: { message: "All properties are invalid" },
    };
  }
  const updateOpeningInput: UpdateOpeningInput = {
    openingId,
    orgId: session.orgId,
    newValues: filteredValues.object,
  };

  const [updatedOpening, error] = await Openings.updateOpening(
    updateOpeningInput
  );

  if (error) {
    return Response.SDK(error, "An error ocurred updating this opening");
  }

  // When updating another opening
  const customMessage = filteredValues.removedKeys.length
    ? `Opening updated! However, some properties could not be updated: '${filteredValues.removedKeys.join(
        ", "
      )}'`
    : `Opening updated!`;

  return {
    statusCode: 200,
    body: {
      message: customMessage,
    },
  };
};

// TODO types with API Gateway event and middleware
// @ts-ignore
module.exports.main = middy(main).use(withDefaultMiddleware);
