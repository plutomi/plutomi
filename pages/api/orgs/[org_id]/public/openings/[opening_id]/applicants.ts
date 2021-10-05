import { CreateApplicant } from "../../../../../../../utils/applicants/createApplicant";
import { NextApiResponse } from "next";
import InputValidation from "../../../../../../../utils/inputValidation";
import { GetOpening } from "../../../../../../../utils/openings/getOpeningById";
const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { body, method, query } = req;
  const { email, first_name, last_name, stage_id } = body;

  const { org_id, opening_id } = query;

  // Create an applicant
  if (method === "POST") {
    const opening = await GetOpening({ org_id, opening_id });

    if (!opening) {
      return res.status(400).json({ message: "Bad opening ID" });
    }
    try {
      const create_applicant_input: CreateApplicantInput = {
        org_id: org_id as string,
        email: email,
        first_name: first_name,
        last_name: last_name,
        opening_id: opening_id,
        stage_id: opening.stage_order[0],
      };
      try {
        InputValidation(create_applicant_input);
      } catch (error) {
        return res.status(400).json({ message: `${error.message}` });
      }

      // TODO send email link here
      await CreateApplicant(create_applicant_input);
      return res.status(201).json({ message: "Applicant created!" });
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to create applicant: ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default handler;
