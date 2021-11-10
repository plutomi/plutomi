import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { GetOpening } from "../../utils/openings/getOpeningById";
import CleanOpening from "../../utils/clean/cleanOpening";
import FormattedResponse from "../../utils/formatResponse";
import withCleanOrgId from "../../middleware/withCleanOrgId";

const main = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  const { orgId, openingId } = event.pathParameters;

  try {
    const opening = await GetOpening(orgId, openingId);
    if (!opening) {
      return FormattedResponse(404, {
        message: `Opening ${openingId} not found`,
      });
    }

    if (!opening.is_public) {
      return FormattedResponse(403, {
        message: "You cannot view this opening",
      });
    }

    const cleanOpening = CleanOpening(opening);

    return FormattedResponse(200, cleanOpening);
  } catch (error) {
    console.error(error);

    // TODO error logger
    // TODO status code
    return FormattedResponse(500, {
      message: `An error ocurred retrieving opening ${openingId} info: ${error}`,
    });
  }
};
exports.handler = withCleanOrgId(main);
