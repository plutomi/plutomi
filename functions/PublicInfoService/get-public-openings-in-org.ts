import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { GetAllOpeningsInOrg } from "../../utils/openings/getAllOpeningsInOrg";
import CleanOpening from "../../utils/clean/cleanOpening";
import FormattedResponse from "../../utils/formatResponse";
const main = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  const { org_id } = event.pathParameters;

  if (!org_id) {
    return FormattedResponse(400, { message: `'org_id' is missing` });
  }

  try {
    const allOpenings = await GetAllOpeningsInOrg(org_id);
    const publicOpenings = allOpenings.filter((opening) => opening.is_public);

    publicOpenings.forEach((opening) => CleanOpening(opening));

    return FormattedResponse(200, publicOpenings);
  } catch (error) {
    console.error(error);

    // TODO error logger
    // TODO status code
    return FormattedResponse(500, {
      message: `An error ocurred retrieving openings for ${org_id}: ${error}`,
    });
  }
};

exports.handler = main;
