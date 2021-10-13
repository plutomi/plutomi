import { NextApiResponse } from "next";
import InputValidation from "../../../../../../../utils/inputValidation";
import withCleanOrgName from "../../../../../../../middleware/withCleanOrgName";
import { CreateApplicantResponse } from "../../../../../../../utils/applicants/createApplicantResponse";
const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { method, query, body } = req;
  const { org_id, applicant_id } = query;
  const responses: DynamoApplicantResponse[] = body.responses;

  // Public route to update limited applicant information, ie: questions & answers
  if (method === "POST") {
    if (!responses || responses.length == 0) {
      return res.status(400).json({ message: "Empty responses" });
    }

    try {
      // Validate all answers
      responses.every((response: DynamoApplicantResponse) => {
        // TODO while this validates, it does not return what went wrong!
        const create_applicant_response_input: CreateApplicantResponseInput = {
          org_id: org_id as string,
          applicant_id: applicant_id as string,
          question_title: response.question_title,
          question_description: response.question_description,
          question_response: response.question_response,
        };
        InputValidation(create_applicant_response_input);
      });
    } catch (error) {
      return res.status(400).json({ message: `Invalid response(s)` });
    }

    try {
      await Promise.all(
        responses.map(async (response: DynamoApplicantResponse) => {
          const { question_title, question_description, question_response } =
            response;

          const create_applicant_response_input: CreateApplicantResponseInput =
            {
              org_id: org_id as string,
              applicant_id: applicant_id as string,
              question_title: question_title,
              question_description: question_description,
              question_response: question_response,
            };

          await CreateApplicantResponse(create_applicant_response_input);
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

export default withCleanOrgName(handler);
