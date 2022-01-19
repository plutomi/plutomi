import Joi from "joi";
import { JOI_SETTINGS, JoiOrgId, withDefaultMiddleware } from "../../Config";
import middy from "@middy/core";
import * as Openings from "../../models/openings";
import { CustomLambdaEvent, CustomLambdaResponse } from "../../types/main";
import * as CreateError from "../../utils/errorGenerator";
import { pick } from "lodash";
import * as Orgs from "../../models/orgs";
import { DynamoNewOpening } from "../../types/dynamo";
interface APIGetPublicOpeningsInOrgPathParameters {
  orgId: string;
}
interface APIGetPublicOpeningsInOrgEvent
  extends Omit<CustomLambdaEvent, "pathParameters"> {
  pathParameters: APIGetPublicOpeningsInOrgPathParameters;
}

const schema = Joi.object({
  pathParameters: {
    orgId: JoiOrgId,
  },
}).options(JOI_SETTINGS);

const main = async (
  event: APIGetPublicOpeningsInOrgEvent
): Promise<CustomLambdaResponse> => {
  try {
    await schema.validateAsync(event);
  } catch (error) {
    return CreateError.JOI(error);
  }

  const { orgId } = event.pathParameters;

  const [openings, openingsError] = await Orgs.getOpeningsInOrg({
    orgId,
  });

  if (openingsError) {
    return CreateError.SDK(
      openingsError,
      "An error ocurred retrieving openings for this org"
    );
  }

  const publicOpenings = openings.filter(
    (opening: DynamoNewOpening) => opening.isPublic && opening.totalStages > 0
  );

  const modifiedOpenings = publicOpenings.map((opening) =>
    pick(opening, ["GSI1SK", "createdAt", "openingId"])
  );

  return {
    statusCode: 200,
    body: modifiedOpenings,
  };
};
// TODO types with API Gateway event and middleware
// @ts-ignore
