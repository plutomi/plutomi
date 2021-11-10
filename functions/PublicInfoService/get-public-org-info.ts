import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { GetOrg } from "../../utils/orgs/getOrg";
import CleanOpening from "../../utils/clean/cleanOpening";
import FormattedResponse from "../../utils/formatResponse";
import CleanOrg from "../../utils/clean/cleanOrg";

const main = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  const { org_id } = event.pathParameters;

  if (!org_id) {
    return FormattedResponse(400, { message: `'org_id' is missing` });
  }

  try {
    const org = await GetOrg(org_id);

    if (!org) {
      return FormattedResponse(404, {
        message: `Org '${org_id}' not found`,
      });
    }

    const cleanOrg = CleanOrg(org);

    return FormattedResponse(200, cleanOrg);
  } catch (error) {
    console.error(error);

    // TODO error logger
    // TODO status code
    return FormattedResponse(500, {
      message: `An error ocurred retrieving info for the org ${org_id}: ${error}`,
    });
  }
};

exports.handler = main;
