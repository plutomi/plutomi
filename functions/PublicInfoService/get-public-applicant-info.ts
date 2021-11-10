import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import FormattedResponse from "../../utils/formatResponse";
import CleanApplicant from "../../utils/clean/cleanApplicant";
import { GetApplicantById } from "../../utils/applicants/getApplicantById";
const main = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  const { orgId, applicantId } = event.pathParameters;

  try {
    const applicant = await GetApplicantById(orgId, applicantId);

    if (!applicant) {
      return FormattedResponse(404, {
        message: `Applicant ${applicant} not found`,
      });
    }

    const cleanApplicant = CleanApplicant(applicant);

    return FormattedResponse(200, cleanApplicant);
  } catch (error) {
    console.error(error);
    // TODO error logger
    // TODO status code
    return FormattedResponse(500, {
      message: `An error ocurred retrieving applicant ${applicantId} info: ${error}`,
    });
  }
};
exports.handler = main;
