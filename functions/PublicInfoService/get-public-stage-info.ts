import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import FormattedResponse from "../../utils/formatResponse";
import { GetStage } from "../../utils/stages/getStage";
import CleanStage from "../../utils/clean/cleanStage";
export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  const { org_id, stage_id } = event.pathParameters;

  if (!org_id) {
    return FormattedResponse(400, { message: `'org_id' is missing` });
  }

  if (!stage_id) {
    return FormattedResponse(400, { message: `'stage_id' is missing` });
  }
  try {
    const stage = await GetStage(org_id, stage_id);
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
}
