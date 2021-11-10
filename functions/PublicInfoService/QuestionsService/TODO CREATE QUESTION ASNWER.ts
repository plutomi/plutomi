import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import FormattedResponse from "../../../utils/formatResponse";
import { CreateApplicantResponse } from "../../../utils/applicants/createApplicantResponse";

// TODO TYPES!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// TODO
type CreateApplicantResponseRequest = APIGatewayProxyEventV2 & {
  body: {
    /// TODO ! FIX THIS TYPE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    /// TODO ! FIX THIS TYPE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    responses: []; // TODO Types!
  }; /// TODO ! FIX THIS TYPE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
}; /// TODO ! FIX THIS TYPE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

/// TODO ! FIX THIS TYPE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

const main = async (
  event: CreateApplicantResponseRequest
): Promise<APIGatewayProxyResultV2> => {
  const { orgId, applicant_id } = event.pathParameters;
  const { responses } = event.body;

  if (!orgId) {
    return FormattedResponse(400, { message: `'orgId' is missing` });
  }

  if (!applicant_id) {
    return FormattedResponse(400, { message: `'applicant_id' is missing` });
  }

  if (!responses || responses.length == 0) {
    return FormattedResponse(400, { message: `'responses' are empty` });
  }

  try {
    // TODO if there is an error here, an applicant will have double responses due to this being promise.all and responses not being unique!!
    // TODO run a delete if error
    await Promise.all(
      responses.map(async (response) => {
        const { question_title, question_description, question_response } =
          response;

        const create_applicant_response_input = {
          orgId: orgId,
          applicant_id: applicant_id,
          question_title: question_title,
          question_description: question_description,
          question_response: question_response,
        };

        await CreateApplicantResponse(create_applicant_response_input);
      })
    );

    return FormattedResponse(200, {
      message: "Questions answered succesfully!",
    });
  } catch (error) {
    // TODO if error, delete the responses!

    console.error(error);
    // TODO error logger
    // TODO status code
    return FormattedResponse(500, {
      message: `An error ocurred answering the questions: ${error}`,
    });
  }
};
exports.handler = main;
