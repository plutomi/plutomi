import { NextApiResponse } from "next";
import InputValidation from "../../../../../../../utils/inputValidation";
import UpdateApplicant from "../../../../../../../utils/applicants/updateApplicant";
import withCleanOrgName from "../../../../../../../middleware/withCleanOrgName";
import { CreateApplicantResponse } from "../../../../../../../utils/applicants/createApplicantResponse";
const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { method, query, body } = req;
  const { org_id, applicant_id } = query;
  const responses: DynamoApplicantResponse[] = body.responses;

  // Public route to update limited applicant information, ie: questions & answers
  if (method === "POST") {
    if (responses.length == 0) {
      return res.status(400).json({ message: "Empty responses" });
    }

    let counter = 0;
    let error_messages = [];
    responses.map(async (response: DynamoApplicantResponse) => {
      const { question_title, question_description, question_response } =
        response;

      // Validate all answers
      try {
        const create_applicant_response_input: CreateApplicantResponseInput = {
          org_id: org_id as string,
          applicant_id: applicant_id as string,
          question_title: question_title,
          question_description: question_description,
          question_response: question_response,
        };

        try {
          InputValidation(create_applicant_response_input);
        } catch (error) {
          return res.status(400).json({ message: `${error.message}` });
        }

        await CreateApplicantResponse(create_applicant_response_input);
        counter++;
      } catch (error) {
        console.error(`Unable to answer question`, error);
        error_messages.push(error);
      }

      if (counter != responses.length) {
        return res.status(500).json({
          message: `Unable to answer questions, please try again - ${error_messages}`,
        });
      }

      return res.status(200).json({ message: "Answered succesfully!" });
    });
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withCleanOrgName(handler);
