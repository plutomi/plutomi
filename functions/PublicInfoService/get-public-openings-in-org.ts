import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { GetAllOpeningsInOrg } from "../../utils/openings/getAllOpeningsInOrg";
import CleanOpening from "../../utils/clean/cleanOpening";
import FormattedResponse from "../../utils/formatResponse";
const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  const { orgId } = event.pathParameters;

  if (!orgId) {
    return FormattedResponse(400, { message: `'orgId' is missing` });
  }

  try {
    const allOpenings = await GetAllOpeningsInOrg(orgId);
    const publicOpenings = allOpenings.filter((opening) => opening.is_public);

    publicOpenings.forEach((opening) => CleanOpening(opening));

    return FormattedResponse(200, publicOpenings);
  } catch (error) {
    console.error(error);

    // TODO error logger
    // TODO status code
    return FormattedResponse(500, {
      message: `An error ocurred retrieving openings for ${orgId}: ${error}`,
    });
  }
};

export default handler;
