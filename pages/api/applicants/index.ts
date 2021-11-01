import { NextApiResponse } from "next";
import { GetOpening } from "../../../utils/openings/getOpeningById";
import InputValidation from "../../../utils/inputValidation";
import { CreateApplicant } from "../../../utils/applicants/createApplicant";
import { GetOrg } from "../../../utils/orgs/getOrg";
import SendApplicantLink from "../../../utils/email/sendApplicantLink";

const handler = async (
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> => {
  const { method, body } = req;
  const { org_id, opening_id, first_name, last_name, email } = body;

  // Creates an applicant
  if (method === "POST") {
    const opening = await GetOpening({ org_id, opening_id });

    if (!opening) {
      return res.status(400).json({ message: "Bad opening ID" });
    }
    try {
      const create_applicant_input: CreateApplicantInput = {
        org_id: org_id,
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

      const new_applicant = await CreateApplicant(create_applicant_input);
      const org = await GetOrg(org_id);

      const send_applicant_link_input = {
        applicant_email: new_applicant.email,
        org_id: org_id,
        org_name: org.GSI1SK,
        applicant_id: new_applicant.applicant_id,
      };
      await SendApplicantLink(send_applicant_link_input);

      return res.status(201).json({
        message: `We've sent a link to your email to complete your application!`,
      });
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
