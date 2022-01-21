import Joi from "joi";
import { JOI_SETTINGS, JoiOrgId, withDefaultMiddleware } from "../../Config";
import middy from "@middy/core";
import * as Openings from "../../models/openings";
import { CustomLambdaEvent, CustomLambdaResponse } from "../../types/main";
import * as CreateError from "../../utils/errorGenerator";
import { pick } from "lodash";
interface APIGetPublicOpeningInfoPathParameters {
  orgId: string;
  openingId: string;
}
interface APIGetPublicOpeningInfoEvent
  extends Omit<CustomLambdaEvent, "pathParameters"> {
  pathParameters: APIGetPublicOpeningInfoPathParameters;
}

const schema = Joi.object({
  pathParameters: {
    orgId: JoiOrgId,
    openingId: Joi.string(),
  },
}).options(JOI_SETTINGS);

const main = async (
  event: APIGetPublicOpeningInfoEvent
): Promise<CustomLambdaResponse> => {
  try {
    await schema.validateAsync(event);
  } catch (error) {
    return CreateError.JOI(error);
  }

  const { orgId, openingId } = event.pathParameters;

  const [opening, openingError] = await Openings.getOpeningById({
    orgId,
    openingId,
  });

  if (openingError) {
    return CreateError.SDK(
      openingError,
      "An error ocurred retrieving information for this opening"
    );
  }

  if (opening.GSI1SK === "PRIVATE" || opening.totalStages === 0) {
    return {
      statusCode: 403,
      body: {
        message: "Unfortunately, you cannot view this opening.",
      },
    };
  }

  const modifiedOpening = pick(opening, [
    "openingName",
    "createdAt",
    "openingId",
  ]);

  return {
    statusCode: 200,
    body: modifiedOpening,
  };
};
// TODO types with API Gateway event and middleware
// @ts-ignore
