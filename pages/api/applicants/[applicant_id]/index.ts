import { GetOpening } from "../../../../utils/openings/getOpeningById";
import withAuthorizer from "../../../../middleware/withAuthorizer";
import { NextApiResponse } from "next";
import { GetApplicantById } from "../../../../utils/applicants/getApplicantById";
import InputValidation from "../../../../utils/inputValidation";
import UpdateOpening from "../../../../utils/openings/updateOpening";
import { DeleteOpening } from "../../../../utils/openings/deleteOpening";
import UpdateApplicant from "../../../../utils/applicants/updateApplicant";
const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const user: DynamoUser = req.user;
  const { method, query, body } = req;
  const { applicant_id } = query;

  const get_applicant_input: GetApplicantInput = {
    org_id: user.org_id,
    applicant_id: applicant_id as string,
  };

  if (method === "GET") {
    try {
      const applicant = await GetApplicantById(get_applicant_input);
      if (!applicant) {
        return res.status(404).json({ message: "Applicant not found" });
      }
      return res.status(200).json(applicant);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to get applicant: ${error}` });
    }
  }

  if (method === "PUT") {
    try {
      const update_applicant_input: UpdateApplicantInput = {
        org_id: user.org_id,
        applicant_id: applicant_id as string,
        updated_applicant: body.updated_applicant,
      };

      try {
        InputValidation(update_applicant_input);
      } catch (error) {
        return res.status(400).json({ message: `${error.message}` });
      }

      await UpdateApplicant(update_applicant_input);
      return res.status(200).json({ message: "Applicant updated!" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Unable to update applicant - ${error}` });
    }
  }

  //   if (method === "DELETE") {
  //     try {
  //       const delete_opening_input = {
  //         org_id: user.org_id,
  //         opening_id: opening_id,
  //       };
  //       await DeleteOpening(delete_opening_input);
  //       return res.status(200).json({ message: "Opening deleted" });
  //     } catch (error) {
  //       return res
  //         .status(500)
  //         .json({ message: `Unable to delete your opening ${error}` });
  //     }
  //   }
  return res.status(405).json({ message: "Not Allowed" });
};

export default withAuthorizer(handler);
