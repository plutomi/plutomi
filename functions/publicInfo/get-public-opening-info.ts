import Joi from "joi";
import { JOI_SETTINGS, JoiOrgId, withDefaultMiddleware } from "../../Config";
import middy from "@middy/core";
import * as Openings from "../../models/openings";
import { CustomLambdaEvent, CustomLambdaResponse } from "../../types/main";
import * as Response from "../../utils/customResponse";
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
    return Response.JOI(error);
  }

  const { orgId, openingId } = event.pathParameters;

  const [opening, openingError] = await Openings.getOpeningById({
    orgId,
    openingId,
  });

  if (openingError) {
    return Response.SDK(
      openingError,
      "An error ocurred retrieving information for this opening"
    );
  }

  if (opening.isPublic || opening.totalStages === 0) {
    return {
      statusCode: 403,
      body: {
        message: "Unfortunately, you cannot view this opening.",
      },
    };
  }

  const modifiedOpening = pick(opening, ["GSI1SK", "createdAt", "openingId"]);

  return {
    statusCode: 200,
    body: modifiedOpening,
  };
};
// TODO types with API Gateway event and middleware
// @ts-ignore
module.exports.main = middy(main).use(withDefaultMiddleware);
