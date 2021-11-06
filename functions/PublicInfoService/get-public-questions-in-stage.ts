import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import FormattedResponse from "../../utils/formatResponse";
import { GetAllQuestionsInStage } from "../../utils/questions/getAllQuestionsInStage";
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
    const allQuestions = await GetAllQuestionsInStage(org_id, stage_id);
    // TODO public / private questions?

    return FormattedResponse(200, allQuestions);
  } catch (error) {
    console.error(error);

    // TODO error logger
    // TODO status code
    return FormattedResponse(500, {
      message: `An error ocurred retrieving questions for the stage ${stage_id}: ${error}`,
    });
  }
}
