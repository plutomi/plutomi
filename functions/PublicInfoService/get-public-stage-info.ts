import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import FormattedResponse from "../../utils/formatResponse";
import { getStage } from "../../utils/stages/getStage";
import CleanStage from "../../utils/clean/cleanStage";
import withCleanOrgId from "../../middleware/withCleanOrgId";

const main = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  const { orgId, stageId } = event.pathParameters;

  try {
    const stage = await getStage(orgId, stageId);
    if (!stage) {
      return FormattedResponse(404, {
        message: `Stage ${stageId} not found`,
      });
    }

    const cleanStage = CleanStage(stage);

    return FormattedResponse(200, cleanStage);
  } catch (error) {
    console.error(error);

    // TODO error logger
    // TODO status code
    return FormattedResponse(500, {
      message: `An error ocurred retrieving stage ${stageId} info: ${error}`,
    });
  }
};

exports.handler = withCleanOrgId(main);
