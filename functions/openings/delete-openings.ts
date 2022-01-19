import middy from "@middy/core";
import Joi from "joi";
import { DEFAULTS, JOI_SETTINGS, withDefaultMiddleware } from "../../Config";
import * as Openings from "../../models/Openings";
import { CustomLambdaEvent, CustomLambdaResponse } from "../../types/main";
import * as CreateError from "../../utils/errorGenerator";

interface APIGetOpeningByIdEvent
  extends Omit<CustomLambdaEvent, "pathParameters"> {
  pathParameters: {
    openingId: string;
  };
}

const schema = Joi.object({
  pathParameters: {
    openingId: Joi.string(),
  },
}).options(JOI_SETTINGS);

const main = async (
  event: APIGetOpeningByIdEvent
): Promise<CustomLambdaResponse> => {
  try {
    await schema.validateAsync(event);
  } catch (error) {
    return CreateError.JOI(error);
  }

  const { orgId } = event.requestContext.authorizer.lambda.session;
  const { openingId } = event.pathParameters;

  const [opening, error] = await Openings.deleteOpening({
    openingId,
    orgId,
  });

  if (error) {
    return CreateError.SDK(error, "An error ocurred deleting your opening");
  }

  return {
    statusCode: 200,
    body: { message: "Opening deleted" },
  };
};

// TODO types with API Gateway event and middleware
// @ts-ignore
