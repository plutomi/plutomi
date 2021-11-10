import { APIGatewayProxyResultV2, APIGatewayProxyEventV2 } from "aws-lambda";
import FormattedResponse from "../../utils/formatResponse";
import { GetOpening } from "../../utils/openings/getOpeningById";
import { CreateApplicant } from "../../utils/applicants/createApplicant";
import withInputValidation from "../../middleware/withInputValidation";
import Joi from "@hapi/joi";

// TODO TODO TODO set max length values in config file
const schema = Joi.object({
  orgId: Joi.string().required(),
  openingId: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  applicantEmail: Joi.string().email().required(),
});

const main = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  const { orgId, openingId, firstName, lastName, email } = JSON.parse(
    event.body
  );

  const opening = await GetOpening(orgId, openingId);

  if (!opening) {
    return FormattedResponse(404, { message: "Opening no longer exists" });
  }

  const createApplicantInput = {
    orgId: orgId,
    applicantEmail: email,
    firstName: firstName,
    lastName: lastName,
    openingId: openingId,
    stageId: opening.stage_order[0], // Put the applicant in the first stage // TODO add option to place an applicant in a specific stage
  };

  try {
    await CreateApplicant(createApplicantInput);
    return FormattedResponse(200, { message: "Applied!" });
  } catch (error) {
    console.error(error);
    // TODO error logger
    // TODO status code
    return FormattedResponse(500, {
      message: `An error ocurred submitting your applciation: ${error}`,
    });
  }
};
exports.handler = withInputValidation(main, schema);
