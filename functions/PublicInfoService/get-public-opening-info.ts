import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { GetOpening } from "../../utils/openings/getOpeningById";
import CleanOpening from "../../utils/clean/cleanOpening";
import FormattedResponse from "../../utils/formatResponse";

export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  const { org_id, opening_id } = event.pathParameters;

  if (!org_id) {
    return FormattedResponse(400, { message: `'org_id' is missing` });
  }

  if (!opening_id) {
    return FormattedResponse(400, { message: `'opening_id' is missing` });
  }
  try {
    const opening = await GetOpening(org_id, opening_id);
    if (!opening) {
      return FormattedResponse(404, {
        message: `Opening ${opening_id} not found`,
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
      message: `An error ocurred retrieving opening ${opening_id} info: ${error}`,
    });
  }
}
