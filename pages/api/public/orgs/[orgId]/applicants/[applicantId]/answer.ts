import { NextApiRequest, NextApiResponse } from "next";
import InputValidation from "../../../../../../../utils/inputValidation";
import withCleanOrgId from "../../../../../../../middleware/withCleanOrgId";
import { createApplicantResponse } from "../../../../../../../utils/applicants/createApplicantResponse";
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query, body } = req;
  const { orgId, applicantId } = query as Pick<
    CUSTOM_QUERY,
    "orgId" | "applicantId"
  >;
  const responses: DynamoApplicantResponse[] = body.responses;

  // Public route to update limited applicant information, ie: questions & answers
  if (method === API_METHODS.POST) {
    if (!responses || responses.length == 0) {
      return res.status(400).json({ message: "Empty responses" });
    }

    try {
      // Validate all answers
      responses.every((response: DynamoApplicantResponse) => {
        // TODO while this validates, it does not return what went wrong!
        const createApplicantResponseInput: CreateApplicantResponseInput = {
          orgId: orgId,
          applicantId: applicantId,
          questionTitle: response.questionTitle,
          questionDescription: response.questionDescription,
          questionResponse: response.questionResponse,
        };
        InputValidation(createApplicantResponseInput);
      });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: `Invalid response(s)` });
    }

    try {
      await Promise.all(
        responses.map(async (response: DynamoApplicantResponse) => {
          const { questionTitle, questionDescription, questionResponse } =
            response;

          const createApplicantResponseInput: CreateApplicantResponseInput = {
            orgId: orgId,
            applicantId: applicantId,
            questionTitle: questionTitle,
            questionDescription: questionDescription,
            questionResponse: questionResponse,
          };

          await createApplicantResponse(createApplicantResponseInput);
        })
      );

      return res
        .status(201)
        .json({ message: `Questions answered succesfully!` });
    } catch (error) {
      return res.status(500).json({
        message: `Unable to answer questions, please try again`,
      });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withCleanOrgId(handler);
