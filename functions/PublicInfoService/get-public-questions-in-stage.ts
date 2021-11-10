import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import FormattedResponse from "../../utils/formatResponse";
import { GetAllQuestionsInStage } from "../../utils/questions/getAllQuestionsInStage";
const main = async (
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
    const allQuestions = await GetAllQuestionsInStage(orgId, stage_id);
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
};

exports.handler = main;
