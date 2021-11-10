import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { GetOrg } from "../../utils/orgs/getOrg";
import FormattedResponse from "../../utils/formatResponse";
import CleanOrg from "../../utils/clean/cleanOrg";
import withCleanOrgId from "../../middleware/withCleanOrgId";

const main = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  console.log("Executing event in public org info", event);
  const { orgId } = event.pathParameters;
  console.log("In api route orgid", orgId);
  if (!orgId) {
    return FormattedResponse(400, { message: `'orgId' is missing` });
  }

  try {
    const org = await GetOrg(orgId);

    if (!org) {
      return FormattedResponse(404, {
        message: `Org '${orgId}' not found`,
      });
    }

    const cleanOrg = CleanOrg(org);

    return FormattedResponse(200, cleanOrg);
  } catch (error) {
    console.error(error);

    // TODO error logger
    // TODO status code
    return FormattedResponse(500, {
      message: `An error ocurred retrieving info for the org ${orgId}: ${error}`,
    });
  }
};

exports.handler = withCleanOrgId(main);
