import { NextApiResponse } from "next";
import { GetApplicantById } from "../../../../utils/applicants/getApplicantById";
import DeleteApplicant from "../../../../utils/applicants/deleteApplicant";
import UpdateApplicant from "../../../../utils/applicants/updateApplicant";
import withSession from "../../../../middleware/withSession";

const handler = async (
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> => {
  const user_session = req.session.get("user");
  if (!user_session) {
    req.session.destroy();
    return res.status(401).json({ message: "Please log in again" });
  }
  const { method, query, body } = req;
  const { applicantId } = query as CustomQuery;

  const get_applicant_input: GetApplicantInput = {
    orgId: user_session.orgId,
    applicantId: applicantId,
  };

  if (method === "GET") {
    try {
      // TODO gather applicant responses here
      const applicant = await GetApplicantById(get_applicant_input);
      // const responses = await GetApplicant
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
        orgId: user_session.orgId,
        applicantId: applicantId,
        new_applicant_values: body.new_applicant_values,
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

  if (method === "DELETE") {
    try {
      await DeleteApplicant({
        orgId: user_session.orgId,
        applicantId: applicantId,
      });
      return res.status(200).json({ message: "Applicant deleted!" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Unable to delete applicant - ${error}` });
    }
  }
  return res.status(405).json({ message: "Not Allowed" });
};

export default withSession(handler);
