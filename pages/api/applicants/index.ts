import { CreateApplicant } from "../../../utils/applicants/createApplicant";
import withAuthorizer from "../../../middleware/withAuthorizer";
import {  NextApiResponse } from "next";
const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { body, method, query } = req;
  const {
    applicant_email,
    applicant_first_name,
    applicant_last_name,
    opening_id,
    stage_id,
  } = body;
  const { org_id } = query;

  if (method === "POST") {
    try {
      const create_applicant_input: CreateApplicantInput = {
        org_id: org_id as string,
        applicant_email: applicant_email,
        applicant_first_name: applicant_first_name,
        applicant_last_name: applicant_last_name,
        opening_id: opening_id,
        stage_id: stage_id, // First stage of the opening
      };
      let missing_keys = [];
      for (const [key, value] of Object.entries(create_applicant_input)) {
        if (value == undefined) {
          missing_keys.push(`'${key}'`);
        }
      }
      if (missing_keys.length > 0)
        return res.status(400).json({
          message: `Bad request: ${missing_keys.join(", ")} missing`,
        });

      const applicant = await CreateApplicant(create_applicant_input);
      return res.status(201).json(applicant);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to create applicant: ${error}` });
    }
  }

  //   if (method === "GET") { // TODO Enable get all applicants?
  //     try {
  //       const all_openings = await GetAllOpeningsInOrg(org_id as string);
  //       return res.status(200).json(all_openings);
  //     } catch (error) {
  //       // TODO add error logger
  //       return res
  //         .status(400) // TODO change #
  //         .json({ message: `Unable to retrieve openings: ${error}` });
  //     }
  //   }
  return res.status(405).json({ message: "Not Allowed" });
};

export default withAuthorizer(handler);
