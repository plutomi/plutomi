import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import FormattedResponse from "../../utils/formatResponse";
import { getStage } from "../../utils/stages/getStage";
import CleanStage from "../../utils/clean/cleanStage";
const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  const { orgId, stage_id } = event.pathParameters;

  if (!orgId) {
    return FormattedResponse(400, { message: `'orgId' is missing` });
  }

  if (!stage_id) {
    return FormattedResponse(400, { message: `'stage_id' is missing` });
  }
  try {
    const stage = await getStage(orgId, stage_id);
    if (!stage) {
      return FormattedResponse(404, {
        message: `Stage ${stage_id} not found`,
      });
    }

    const cleanStage = CleanStage(stage);

    return FormattedResponse(200, cleanStage);
  } catch (error) {
    console.error(error);

    // TODO error logger
    // TODO status code
    return FormattedResponse(500, {
      message: `An error ocurred retrieving stage ${stage_id} info: ${error}`,
    });
  }
};

export default handler;
