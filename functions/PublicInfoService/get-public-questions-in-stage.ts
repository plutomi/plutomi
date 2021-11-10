import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import FormattedResponse from "../../utils/formatResponse";
import { GetAllQuestionsInStage } from "../../utils/questions/getAllQuestionsInStage";
import withCleanOrgId from "../../middleware/withCleanOrgId";

const main = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  const { orgId, stageId } = event.pathParameters;

  try {
    const allQuestions = await GetAllQuestionsInStage(orgId, stageId);
    // TODO public / private questions?

    return FormattedResponse(200, allQuestions);
  } catch (error) {
    console.error(error);

    // TODO error logger
    // TODO status code
    return FormattedResponse(500, {
      message: `An error ocurred retrieving questions for the stage ${stageId}: ${error}`,
    });
  }
};

exports.handler = withCleanOrgId(main);
